import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { AuthService } from 'src/app/Core/Services/auth.service';
import {
  BlackjackRealtimeService, BjChairSnap, BjHandSnap, BjSnapshot, BjState,
} from 'src/app/Core/Services/blackjack-realtime.service';
import { ICON_BACK, ICON_ADD, ICON_PERSON, ICON_TIME, ICON_HAND_LEFT, ICON_ELLIPSE, ICON_COPY, ICON_FLAG, ICON_TRASH } from '../shared/icons/icons';
import { Card, handValue, cardBaseValue } from './Cards/cards.logic';
import { HandComponent } from './Cards/hand/hand.component';
import { ActionBtnComponent } from './Components/action-btn/action-btn.component';
import { BotSeatComponent, Bot } from './Components/bot-seat/bot-seat.component';
import { ChipTokenComponent } from './Components/chip-token/chip-token.component';
import { SeatSpotComponent } from './Components/seat-spot/seat-spot.component';
import { BOT_TINTS, BOT_AVATARS } from './blackjack.data';

// Vista de la mano propia que espera el template (heredada del diseño original)
interface YouHand {
  cards:  Card[];
  bet:    number;
  done:   boolean;
  result: string | null;
}

// El componente es SOLO una vista: todo el juego (cartas, turnos, dinero,
// timers) vive en el servidor y llega como snapshots por SignalR.
//
// Los snapshots traen objetos nuevos en cada broadcast; si el template los
// recibiera directo, Angular recrearía TODO el DOM de cartas y las animaciones
// de reparto se re-dispararían en cada mensaje (parpadeo). Por eso el estado
// visual (hands/dealer/bots) son campos persistentes que se RECONCILIAN con
// cada snapshot: las cartas ya pintadas conservan identidad y solo se montan
// (y animan) las nuevas.
@Component({
  standalone: true,
  imports: [
    CommonModule, IonicModule, SvgIconComponent, HandComponent,
    BotSeatComponent, SeatSpotComponent, ChipTokenComponent, ActionBtnComponent,
  ],
  selector: 'app-blackjack',
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.scss'],
})
export class BlackjackComponent implements OnInit, OnDestroy {
  // Iconos
  iconBack  = ICON_BACK;
  iconAdd   = ICON_ADD;
  iconPerson = ICON_PERSON;
  iconTime  = ICON_TIME;
  iconHit   = ICON_ADD;
  iconStand = ICON_HAND_LEFT;
  iconDouble = ICON_ELLIPSE;
  iconSplit = ICON_COPY;
  iconSurrender = ICON_FLAG;
  iconClear = ICON_TRASH;

  table = { id: 0, min: 10, max: 1000 };

  chip = 10;
  count = 0;
  history: (number | string)[] = [];
  msg: string | null = null;

  // ── Estado visual persistente (reconciliado con cada snapshot) ─────────────
  dealer: { cards: Card[]; hole: boolean } = { cards: [], hole: true };
  hands: YouHand[] = [{ cards: [], bet: 0, done: false, result: null }];
  bots: Bot[] = [0, 1, 2].map(i => ({
    name: '', balance: 0, tint: BOT_TINTS[i], avatar: BOT_AVATARS[i],
    bet: 0, cards: [], status: '', tone: 'dark' as const,
  }));

  private localBet = 0;      // fichas acumuladas antes de confirmar la apuesta
  private placing = false;   // apuesta enviada, esperando confirmación del server
  private activeHandIdx = 0;
  private prevState: BjState | null = null;
  private countTimer: ReturnType<typeof setInterval> | null = null;
  private msgTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private balanceService: BalanceService,
    private authService: AuthService,
    private rt: BlackjackRealtimeService,
  ) {
    // Resultado personal de la ronda: el balance nuevo viene del servidor
    effect(() => {
      const r = this.rt.lastResult();
      if (r?.newBalance != null) this.balanceService.set(r.newBalance);
      if (r) {
        if (r.profit > 0)       this.flash('¡Ganaste ' + this.fmt(r.payout) + '!');
        else if (r.payout > 0)  this.flash('Recuperas ' + this.fmt(r.payout));
        this.rt.lastResult.set(null);
      }
    });

    // Expulsión por inactividad
    effect(() => {
      const k = this.rt.kicked();
      if (k) {
        this.rt.kicked.set(null);
        this.flash(k);
        setTimeout(() => this.router.navigate(['/blackjack-lobby']), 1600);
      }
    });

    // Cada snapshot: reconciliar vista + transiciones de fase
    effect(() => {
      const s = this.rt.room();
      if (!s) return;

      this.table = { id: s.roomId, min: s.min, max: s.max };
      this.syncFromSnapshot(s);

      if (s.state === 'betting' && this.prevState !== 'betting') {
        this.localBet = 0;
        this.placing = false;
      }
      if (s.state === 'settled' && this.prevState !== 'settled') {
        const main = this.hands[0];
        if (main && main.cards.length > 0) {
          const tag = main.result === 'bj' ? 'BJ' : handValue(main.cards).total;
          this.history = [tag, ...this.history].slice(0, 6);
        }
      }
      this.prevState = s.state;
    });
  }

  ngOnInit() {
    if (this.authService.currentProfile()?.isGuest) {
      this.router.navigate(['/auth/register'], { queryParams: { motivo: 'invitado' } });
      return;
    }

    this.balanceService.load();

    const roomId = Number(this.route.snapshot.paramMap.get('id')) || 1;
    this.rt.joinRoom(roomId).catch(err => {
      this.flash(this.errMsg(err));
      setTimeout(() => this.router.navigate(['/blackjack-lobby']), 1600);
    });

    // Tick local solo para pintar el countdown que fija el servidor
    this.countTimer = setInterval(() => {
      const ends = this.snap?.phaseEndsUtc;
      this.count = ends
        ? Math.max(0, Math.ceil((new Date(ends).getTime() - Date.now()) / 1000))
        : 0;
      if (this.chip < this.table.min) this.chip = this.table.min;
    }, 300);
  }

  ngOnDestroy() {
    if (this.countTimer) clearInterval(this.countTimer);
    if (this.msgTimer) clearTimeout(this.msgTimer);
    this.rt.leaveRoom();
  }

  // ── Reconciliación: aplicar el snapshot mutando en sitio ───────────────────

  /** Conserva los objetos Card ya montados; solo agrega/reemplaza lo que cambió. */
  private static syncCards(target: Card[], next: Card[]) {
    let common = 0;
    while (
      common < target.length && common < next.length
      && target[common].r === next[common].r && target[common].s === next[common].s
    ) common++;
    target.length = common;
    for (let i = common; i < next.length; i++) target.push(next[i]);
  }

  private syncFromSnapshot(s: BjSnapshot) {
    const myId = this.rt.myUserId;

    // Crupier: si hay carta oculta, el server solo manda la visible y aquí se
    // agrega un dorso local (la carta real jamás llega al navegador)
    const dealerCards = s.dealer.hole && s.dealer.cards.length > 0
      ? [...s.dealer.cards, { r: '?', s: 'S' } as Card]
      : s.dealer.cards;
    BlackjackComponent.syncCards(this.dealer.cards, dealerCards);
    this.dealer.hole = s.dealer.hole;

    // Mi silla → mis manos
    const mine = s.chairs.find(
      (c): c is BjChairSnap => !!c && c.type === 'player' && c.userId === myId,
    ) ?? null;
    this.activeHandIdx = mine?.activeHand ?? 0;
    this.syncMyHands(mine?.hands ?? null);

    // Las otras 3 sillas (humanos o bots) en los asientos visuales de siempre
    const others = s.chairs.filter(
      (c): c is BjChairSnap => !!c && !(c.type === 'player' && c.userId === myId),
    ).slice(0, 3);

    for (let i = 0; i < 3; i++) {
      const bot = this.bots[i];
      const c = others[i] ?? null;
      if (!c) {
        bot.name = ''; bot.bet = 0; bot.status = ''; bot.tone = 'dark';
        bot.cards.length = 0;
        continue;
      }
      const hand = c.hands?.[c.activeHand] ?? c.hands?.[0] ?? null;
      bot.name = c.name;
      bot.avatar = c.avatar || BOT_AVATARS[i % BOT_AVATARS.length];
      bot.bet = c.bet || (hand?.bet ?? 0);
      bot.status = this.seatStatus(s, c, hand);
      bot.tone = this.seatTone(hand);
      bot.done = hand?.done;
      BlackjackComponent.syncCards(bot.cards, hand?.cards ?? []);
    }
  }

  private syncMyHands(server: BjHandSnap[] | null) {
    const src: (BjHandSnap | null)[] = server && server.length > 0 ? server : [null];
    while (this.hands.length > src.length) this.hands.pop();
    while (this.hands.length < src.length)
      this.hands.push({ cards: [], bet: 0, done: false, result: null });

    src.forEach((h, i) => {
      const t = this.hands[i];
      if (!h) {
        t.cards.length = 0; t.bet = 0; t.done = false; t.result = null;
        return;
      }
      BlackjackComponent.syncCards(t.cards, h.cards);
      t.bet = h.bet;
      t.done = h.done;
      t.result = h.result === 'blackjack' ? 'bj' : h.result;
    });
  }

  private seatStatus(s: BjSnapshot, c: BjChairSnap, hand: BjHandSnap | null): string {
    if (s.state === 'acting' && s.turnChair === c.index) return 'JUGANDO';
    switch (hand?.result) {
      case 'blackjack': return '¡BLACKJACK!';
      case 'win':       return 'GANA';
      case 'push':      return 'EMPATE';
      case 'surrender': return 'SE RINDE';
      case 'lose':      return hand.total > 21 ? 'SE PASA' : 'PIERDE';
    }
    if (hand?.done) return 'PLANTARSE';
    return '';
  }

  private seatTone(hand: BjHandSnap | null): 'dark' | 'win' | 'bust' {
    if (hand?.result === 'win' || hand?.result === 'blackjack') return 'win';
    if (hand?.result === 'lose' && hand.total > 21) return 'bust';
    return 'dark';
  }

  // ── Estado derivado ────────────────────────────────────────

  private get snap(): BjSnapshot | null { return this.rt.room(); }

  private get myChair(): BjChairSnap | null {
    const myId = this.rt.myUserId;
    return this.snap?.chairs.find(
      (c): c is BjChairSnap => !!c && c.type === 'player' && c.userId === myId,
    ) ?? null;
  }

  get balance(): number { return this.balanceService.balance() ?? 0; }

  private get betPlaced(): boolean { return this.placing || (this.myChair?.bet ?? 0) > 0; }

  get myBet(): number {
    if (this.snap?.state === 'betting' && !this.betPlaced) return this.localBet;
    return this.myChair?.bet ?? this.localBet;
  }

  get phase(): 'bet' | 'deal' | 'you' | 'resolve' | 'done' {
    switch (this.snap?.state) {
      case 'betting': return this.betPlaced ? 'deal' : 'bet';
      case 'acting':  return 'you';
      case 'dealer':  return 'resolve';
      case 'settled': return 'done';
      default:        return 'deal';
    }
  }

  get showWaitingOverlay(): boolean {
    const s = this.snap?.state;
    return s === 'waiting' || s === 'starting';
  }

  // ── Mesa privada ───────────────────────────────────────────
  get isPrivateLobby(): boolean { return this.snap?.state === 'lobby'; }
  get inviteCode(): string { return this.snap?.inviteCode ?? ''; }
  get isOwner(): boolean {
    return !!this.snap?.ownerUserId && this.snap.ownerUserId === this.rt.myUserId;
  }

  copyCode() {
    if (!this.inviteCode) return;
    navigator.clipboard?.writeText(this.inviteCode)
      .then(() => this.flash('Código copiado'))
      .catch(() => this.flash(this.inviteCode));
  }

  async shareCode() {
    if (!this.inviteCode) return;
    const text = `Únete a mi mesa privada de Blackjack en Biozin Royale con el código ${this.inviteCode}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* usuario canceló */ }
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    }
  }

  startGame() {
    this.rt.startGame().catch(err => this.flash(this.errMsg(err)));
  }

  get waitingPlayers(): number {
    const s = this.snap;
    if (!s) return 1;
    const seated = s.chairs.filter(c => c?.type === 'player').length;
    return Math.max(1, seated + s.spectators.length);
  }

  get isSpectator(): boolean {
    const s = this.snap?.state;
    return !!this.snap && !this.showWaitingOverlay
      && s !== 'betting' && this.myChair === null;
  }

  get waitingBets(): boolean {
    return this.snap?.state === 'betting' && this.betPlaced;
  }

  /** Tengo silla pero no aposté: la ronda corre (con bots) y yo miro */
  get sittingOut(): boolean {
    const s = this.snap?.state;
    const enRonda = s === 'dealing' || s === 'acting' || s === 'dealer' || s === 'settled';
    return enRonda && this.myChair !== null && !(this.myChair.hands && this.myChair.hands.length > 0);
  }

  get dealerTone(): 'dark' | 'win' | 'bust' {
    const d = this.snap?.dealer;
    return d && !d.hole && (d.total ?? 0) > 21 ? 'bust' : 'dark';
  }

  // ── Helpers ────────────────────────────────────────────────
  fmt(n: number): string {
    return '$' + Number(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  fmtShort(n: number): string { return this.fmt(n).replace('.00', ''); }

  private flash(m: string) {
    if (this.msgTimer) clearTimeout(this.msgTimer);
    this.msg = m;
    this.msgTimer = setTimeout(() => this.msg = null, 2200);
  }

  // Extrae el mensaje de HubException del error de SignalR
  private errMsg(err: unknown): string {
    const raw = err instanceof Error ? err.message : String(err);
    return /HubException: (.*)$/.exec(raw)?.[1] ?? 'No se pudo completar la acción.';
  }

  get chipVals(): number[] {
    return [10, 25, 50, 100, 250].filter(v => v <= this.table.max);
  }

  chipDenom(v: number): number {
    return [100, 25, 10, 5, 1].find(d => v >= d) || 1;
  }

  chipImg(v: number): string { return `assets/chip-${this.chipDenom(v)}.png`; }

  // ── Apuestas (solo UI local hasta confirmar; el server valida todo) ────────
  addChip() {
    if (this.phase !== 'bet') return;
    if (this.localBet + this.chip > this.table.max) {
      this.flash('Máximo de mesa: ' + this.fmt(this.table.max));
      return;
    }
    if (this.localBet + this.chip > this.balance) {
      this.flash('Saldo insuficiente');
      return;
    }
    this.localBet += this.chip;
  }

  selectChip(v: number) { this.chip = v; }

  clearBet() {
    if (this.phase !== 'bet' || this.localBet === 0) return;
    this.localBet = 0;
    this.flash('Apuesta borrada');
  }

  deal() {
    if (this.phase !== 'bet' || this.placing) return;
    if (this.localBet < this.table.min) {
      this.flash('Mínimo: ' + this.fmt(this.table.min));
      return;
    }
    this.placing = true;
    this.rt.placeBet(this.localBet)
      .then(() => {
        // El server ya debitó la wallet: reflejarlo sin esperar la siguiente carga
        this.balanceService.set(Math.round((this.balance - this.localBet) * 100) / 100);
      })
      .catch(err => {
        this.placing = false;
        this.flash(this.errMsg(err));
      });
  }

  // ── Acciones (viajan al hub; habilitación cosmética, el server revalida) ───
  get curHand(): YouHand { return this.hands[this.activeHandIdx] || this.hands[0]; }

  get canAct(): boolean {
    return this.snap?.state === 'acting'
      && this.snap.turnChair != null
      && this.snap.turnChair === this.myChair?.index
      && !this.curHand.done;
  }

  get canDouble(): boolean {
    return this.canAct && this.curHand.cards.length === 2 && this.balance >= this.curHand.bet;
  }

  get canSplit(): boolean {
    return this.canAct && this.hands.length === 1 && this.curHand.cards.length === 2
      && cardBaseValue(this.curHand.cards[0].r) === cardBaseValue(this.curHand.cards[1].r)
      && this.balance >= this.curHand.bet;
  }

  get canSurrender(): boolean {
    return this.canAct && this.hands.length === 1 && this.curHand.cards.length === 2;
  }

  private send(action: 'hit' | 'stand' | 'double' | 'split' | 'surrender') {
    if (!this.canAct) return;
    this.rt.action(action).catch(err => this.flash(this.errMsg(err)));
  }

  hit()       { this.send('hit'); }
  stand()     { this.send('stand'); }
  double()    { if (this.canDouble)    this.send('double'); }
  split()     { if (this.canSplit)     this.send('split'); }
  surrender() { if (this.canSurrender) this.send('surrender'); }

  // ── Status bajo tu mano ────────────────────────────────────
  get youStatus(): { t: string; c: string } | null {
    const h = this.hands[0];
    if (!h || h.cards.length === 0) return null;
    if (this.hands.length === 1) {
      if (h.result === 'bj')    return { t: '¡BLACKJACK!', c: 'var(--gold-1)' };
      if (h.result === 'win')   return { t: 'GANAS', c: '#4fd190' };
      if (h.result === 'push')  return { t: 'EMPATE', c: 'var(--cream)' };
      if (h.result === 'lose')  return { t: handValue(h.cards).total > 21 ? 'TE PASASTE' : 'PIERDES', c: '#e06a6a' };
      if (h.result === 'surrender') return { t: 'TE RENDISTE', c: '#9a8a68' };
    }
    return null;
  }

  handTone(h: YouHand): 'dark' | 'win' | 'bust' {
    if (h.result === 'win' || h.result === 'bj') return 'win';
    if (h.result === 'lose') return 'bust';
    return 'dark';
  }

  isHandActive(i: number): boolean {
    return this.hands.length > 1 && i === this.activeHandIdx && this.canAct;
  }

  isHandWin(h: YouHand): boolean {
    return h.result === 'win' || h.result === 'bj';
  }

  historyBg(h: number | string): string {
    if (h === 'BJ') return 'linear-gradient(180deg,#c79a32,#8a6a1e)';
    if (typeof h === 'number' && (h === 16 || h > 21)) return '#7a2620';
    return '#176b39';
  }

  // ── Nav / abandono ─────────────────────────────────────────
  go(to: string) { this.router.navigate([to]); }

  showLeaveConfirm = false;
  /** Adónde navegar al confirmar: salir a la lista de mesas o ir a depositar */
  private leaveTarget: string[] = ['/blackjack-lobby'];

  /** Ronda en curso (apuesta ya comprometida) vs. ya liquidada o sin empezar */
  private get roundLive(): boolean {
    const s = this.snap?.state;
    return s === 'betting' || s === 'dealing' || s === 'acting' || s === 'dealer';
  }

  get leaveConfirmMessage(): string {
    if (this.isOwner && this.isPrivateLobby) {
      return 'Eres el anfitrión: si sales ahora, la mesa se cerrará para todos los invitados.';
    }
    if (this.myBet > 0 && this.roundLive) {
      return `Tienes una apuesta activa de ${this.fmt(this.myBet)}. Tu mano se jugará ` +
        'automáticamente (plantándose) y el resultado se aplicará a tu saldo igual.';
    }
    return 'Perderás tu lugar en la mesa.';
  }

  /** Sin nada en juego (ni apuesta, ni mesa privada como anfitrión): sale directo */
  private get leaveIsRisky(): boolean {
    return (this.myBet > 0 && this.roundLive) || (this.isOwner && this.isPrivateLobby);
  }

  requestLeave() {
    this.leaveTarget = ['/blackjack-lobby'];
    if (this.leaveIsRisky) { this.showLeaveConfirm = true; return; }
    this.router.navigate(this.leaveTarget);
  }

  /** El botón "+" de depositar también saca de la mesa (mismo ngOnDestroy que
   * el botón de volver) — pasa por la misma confirmación antes de navegar. */
  goDeposito() {
    this.leaveTarget = ['/deposito'];
    if (this.leaveIsRisky) { this.showLeaveConfirm = true; return; }
    this.router.navigate(this.leaveTarget);
  }

  cancelLeave() { this.showLeaveConfirm = false; }

  confirmLeave() {
    this.showLeaveConfirm = false;
    this.router.navigate(this.leaveTarget);
  }
}
