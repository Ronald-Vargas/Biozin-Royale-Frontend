import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ICON_BACK, ICON_ADD, ICON_PERSON, ICON_TIME, ICON_HAND_LEFT, ICON_ELLIPSE, ICON_COPY, ICON_FLAG, ICON_HOME, ICON_ALBUMS, ICON_GIFT, ICON_WALLET, ICON_PERSON_OUTLINE } from '../shared/icons/icons';
import { Card, makeShoe, isBlackjack, cardBaseValue, handValue } from './Cards/cards.logic';
import { HandComponent } from './Cards/hand/hand.component';
import { ActionBtnComponent } from './Components/action-btn/action-btn.component';
import { BotSeatComponent, Bot } from './Components/bot-seat/bot-seat.component';
import { ChipTokenComponent } from './Components/chip-token/chip-token.component';
import { SeatSpotComponent } from './Components/seat-spot/seat-spot.component';
import { BjTable } from './Lobby/tables.data';
import { BOT_NAMES, BOT_TINTS, BOT_AVATARS, botBet } from './blackjack.data';

interface YouHand {
  cards:  Card[];
  bet:    number;
  done:   boolean;
  result: string | null;
}

interface Dealer { cards: Card[]; hole: boolean; }

interface NavItem { label: string; icon: string; to: string; }

type Phase = 'bet' | 'deal' | 'you' | 'resolve' | 'done';

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


  // Estado de mesa
  table: BjTable = { id: 4, min: 10, max: 1000, players: 2, max_players: 4, secs: 150, tag: null };

  balance  = 1250;
  phase: Phase = 'bet';
  chip     = 10;
  myBet    = 0;
  count    = 15;

  dealer: Dealer = { cards: [], hole: true };
  hands: YouHand[] = [{ cards: [], bet: 0, done: false, result: null }];
  active   = 0;
  bots: Bot[] = [];
  history: (number | string)[] = [21, 18, 16, 'BJ', 20];
  msg: string | null = null;

  private shoe: Card[] = [];
  private lockRef = false;
  private countTimer: ReturnType<typeof setTimeout> | null = null;
  private msgTimer:   ReturnType<typeof setTimeout> | null = null;
  private nextRoundTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    private balanceService: BalanceService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Recibe la mesa por state de navegación
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || history.state;
    if (state && state.table) this.table = state.table;

    this.chip = Math.max(10, this.table.min);

    if (this.authService.currentProfile()?.isGuest) {
      this.balance = 0;
    } else {
      this.balanceService.fetch().subscribe(b => { this.balance = b; });
    }

    this.bots = BOT_NAMES.map((n, i) => ({
      name: n, balance: 700 + i * 130, tint: BOT_TINTS[i], avatar: BOT_AVATARS[i],
      bet: 0, cards: [], status: '', tone: 'dark',
    }));

    this.startCountdown();
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private clearTimers() {
    if (this.countTimer)     clearTimeout(this.countTimer);
    if (this.msgTimer)       clearTimeout(this.msgTimer);
    if (this.nextRoundTimer) clearTimeout(this.nextRoundTimer);
  }

  // ── Helpers ────────────────────────────────────────────────
  fmt(n: number): string {
    return '$' + Number(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  fmtShort(n: number): string { return this.fmt(n).replace('.00', ''); }

  private draw(): Card {
    if (this.shoe.length < 15) this.shoe = makeShoe(6);
    return this.shoe.pop()!;
  }

  private flash(m: string) {
    if (this.msgTimer) clearTimeout(this.msgTimer);
    this.msg = m;
    this.msgTimer = setTimeout(() => this.msg = null, 1900);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  private saveBalance() {
    this.balanceService.save(this.balance).subscribe();
  }

  get chipVals(): number[] {
    return [10, 25, 50, 100, 250].filter(v => v <= this.table.max);
  }

  chipDenom(v: number): number {
    return [100, 25, 10, 5, 1].find(d => v >= d) || 1;
  }

  chipImg(v: number): string { return `assets/chip-${this.chipDenom(v)}.png`; }

  // ── Countdown de apuestas ──────────────────────────────────
  private startCountdown() {
    if (this.phase !== 'bet') return;
    this.countTimer = setTimeout(() => this.tickCountdown(), 1000);
  }

  private tickCountdown() {
    if (this.phase !== 'bet') return;
    if (this.count <= 0) {
      if (this.myBet >= this.table.min) {
        this.startRound();
      } else {
        this.count = 15;
        this.startCountdown();
      }
      return;
    }
    this.count--;
    this.startCountdown();
  }

  // ── Apuestas ───────────────────────────────────────────────
  addChip() {
    if (this.phase !== 'bet') return;
    if (this.myBet + this.chip > this.table.max) {
      this.flash('Máximo de mesa: ' + this.fmt(this.table.max));
      return;
    }
    if (this.myBet + this.chip > this.balance) {
      this.flash('Saldo insuficiente');
      return;
    }
    this.myBet += this.chip;
  }

  selectChip(v: number) { this.chip = v; }
  clearBet() { if (this.phase === 'bet') this.myBet = 0; }

  deal() {
    if (this.authService.currentProfile()?.isGuest) {
      this.router.navigate(['/auth/register'], { queryParams: { motivo: 'invitado' } });
      return;
    }
    if (this.myBet >= this.table.min) this.count = 0;
    else this.flash('Mínimo: ' + this.fmt(this.table.min));
  }

  // ── Iniciar ronda ──────────────────────────────────────────
  private async startRound() {
    if (this.lockRef || this.myBet < this.table.min) return;
    this.lockRef = true;
    if (this.countTimer) clearTimeout(this.countTimer);
    this.phase = 'deal';

    // Bots eligen apuesta
    this.bots = this.bots.map(b => {
      const bet = Math.min(b.balance, botBet(this.table.min, this.table.max));
      return { ...b, bet, cards: [], status: '', tone: 'dark', balance: +(b.balance - bet).toFixed(2) };
    });
    this.balance = +(this.balance - this.myBet).toFixed(2);
    this.saveBalance();

    this.hands = [{ cards: [], bet: this.myBet, done: false, result: null }];
    this.dealer = { cards: [], hole: true };
    await this.sleep(250);

    // Repartir dos rondas: bots, tú, crupier
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < this.bots.length; i++) {
        this.bots[i] = { ...this.bots[i], cards: [...this.bots[i].cards, this.draw()] };
        this.bots = [...this.bots];
        await this.sleep(140);
      }
      this.hands[0] = { ...this.hands[0], cards: [...this.hands[0].cards, this.draw()] };
      this.hands = [{ ...this.hands[0] }];
      await this.sleep(140);
      this.dealer.cards = [...this.dealer.cards, this.draw()];
      this.dealer = { ...this.dealer };
      await this.sleep(140);
    }

    // Naturales de bots
    this.bots.forEach((b, i) => {
      if (isBlackjack(b.cards)) {
        this.bots[i] = { ...b, status: '¡BLACKJACK!', tone: 'win', done: true };
      }
    });
    this.bots = [...this.bots];

    // ¿Tu natural?
    if (isBlackjack(this.hands[0].cards)) {
      this.hands = [{ ...this.hands[0], done: true, result: 'bj' }];
      this.lockRef = false;
      await this.sleep(500);
      this.finishYou();
      return;
    }

    this.active = 0;
    this.phase = 'you';
    this.lockRef = false;
  }

  // ── Getters de acciones ────────────────────────────────────
  get curHand(): YouHand { return this.hands[this.active] || this.hands[0]; }

  get canAct(): boolean {
    return this.phase === 'you' && this.curHand && !this.curHand.done;
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

  // ── Acciones ───────────────────────────────────────────────
  private advance(hs: YouHand[]) {
    let next = -1;
    for (let i = this.active + 1; i < hs.length; i++) {
      if (!hs[i].done) { next = i; break; }
    }
    if (next >= 0) {
      this.active = next;
    } else {
      this.phase = 'resolve';
      setTimeout(() => this.finishYou(hs), 350);
    }
  }

  hit() {
    if (!this.canAct) return;
    const hs = this.hands.map(h => ({ ...h, cards: [...h.cards] }));
    hs[this.active].cards.push(this.draw());
    const { total } = handValue(hs[this.active].cards);
    if (total > 21) { hs[this.active].done = true; hs[this.active].result = 'bust'; }
    this.hands = hs;
    if (hs[this.active].done) setTimeout(() => this.advance(hs), 300);
  }

  stand() {
    if (!this.canAct) return;
    const hs = this.hands.map(h => ({ ...h }));
    hs[this.active].done = true;
    this.hands = hs;
    this.advance(hs);
  }

  double() {
    if (!this.canDouble) return;
    this.balance = +(this.balance - this.curHand.bet).toFixed(2);
    this.saveBalance();
    const hs = this.hands.map(h => ({ ...h, cards: [...h.cards] }));
    hs[this.active].bet *= 2;
    hs[this.active].cards.push(this.draw());
    const { total } = handValue(hs[this.active].cards);
    hs[this.active].done = true;
    if (total > 21) hs[this.active].result = 'bust';
    this.hands = hs;
    setTimeout(() => this.advance(hs), 350);
  }

  split() {
    if (!this.canSplit) return;
    this.balance = +(this.balance - this.curHand.bet).toFixed(2);
    this.saveBalance();
    const [c1, c2] = this.curHand.cards;
    const h1: YouHand = { cards: [c1, this.draw()], bet: this.curHand.bet, done: false, result: null };
    const h2: YouHand = { cards: [c2, this.draw()], bet: this.curHand.bet, done: false, result: null };
    this.hands = [h1, h2];
    this.active = 0;
  }

  surrender() {
    if (!this.canSurrender) return;
    this.balance = +(this.balance + this.curHand.bet / 2).toFixed(2);
    this.saveBalance();
    const hs = this.hands.map(h => ({ ...h }));
    hs[this.active].done = true;
    hs[this.active].result = 'surrender';
    this.hands = hs;
    this.phase = 'resolve';
    setTimeout(() => this.finishYou(hs), 350);
  }

  // ── Resolver: bots + crupier + liquidación ─────────────────
  private async finishYou(finalYouHands?: YouHand[]) {
    let botState = this.bots.map(b => ({ ...b, cards: [...b.cards] }));

    // Bots juegan (saltan naturales / sin apuesta)
    for (let i = 0; i < botState.length; i++) {
      const b = botState[i];
      if (!b.bet || b.done) continue;
      while (handValue(b.cards).total < 17) {
        b.cards.push(this.draw());
        botState[i] = { ...b, cards: [...b.cards] };
        this.bots = [...botState];
        await this.sleep(260);
      }
      const tot = handValue(b.cards).total;
      botState[i] = { ...b, status: tot > 21 ? 'SE PASA' : 'PLANTARSE', tone: tot > 21 ? 'bust' : 'dark', done: true };
      this.bots = [...botState];
      await this.sleep(200);
    }

    // Crupier revela + juega
    let dl: Dealer = { cards: [...this.dealer.cards], hole: false };
    this.dealer = { ...dl };
    await this.sleep(500);
    while (handValue(dl.cards).total < 17) {
      dl.cards.push(this.draw());
      this.dealer = { cards: [...dl.cards], hole: false };
      await this.sleep(450);
    }
    const dealerTotal = handValue(dl.cards).total;
    const dealerBust  = dealerTotal > 21;
    const dealerBJ    = isBlackjack(dl.cards);

    // Liquidar tus manos
    let payout = 0;
    const finalHands = (finalYouHands || this.hands).map(h => ({ ...h }));
    finalHands.forEach(h => {
      if (h.result === 'surrender') return;
      const t = handValue(h.cards).total;
      if (t > 21) { h.result = 'lose'; return; }
      const natural = finalHands.length === 1 && isBlackjack(h.cards);
      if (natural && !dealerBJ) { h.result = 'bj'; payout += h.bet * 2.5; return; }
      if (dealerBust || t > dealerTotal) { h.result = 'win'; payout += h.bet * 2; }
      else if (t === dealerTotal && natural === dealerBJ) { h.result = 'push'; payout += h.bet; }
      else { h.result = 'lose'; }
    });
    if (payout > 0) {
      this.balance = +(this.balance + payout).toFixed(2);
      this.saveBalance();
    }
    this.hands = finalHands;

    // Liquidar bots (visual)
    this.bots = this.bots.map(b => {
      if (!b.bet) return b;
      const t = handValue(b.cards).total;
      let win = false, push = false;
      if (isBlackjack(b.cards)) win = !dealerBJ;
      else if (t <= 21 && (dealerBust || t > dealerTotal)) win = true;
      else if (t <= 21 && t === dealerTotal) push = true;
      const add = win ? (isBlackjack(b.cards) ? b.bet * 2.5 : b.bet * 2) : (push ? b.bet : 0);
      return {
        ...b,
        balance: +(b.balance + add).toFixed(2),
        status: t > 21 ? 'SE PASA' : win ? 'GANA' : push ? 'EMPATE' : 'PIERDE',
        tone: win ? 'win' : 'dark',
      };
    });

    // Historial + mensaje
    const main = finalHands[0];
    const tag = main.result === 'bj' ? 'BJ' : handValue(main.cards).total;
    this.history = [tag, ...this.history].slice(0, 6);

    const won  = finalHands.some(h => h.result === 'win' || h.result === 'bj');
    const lost = finalHands.every(h => h.result === 'lose');
    if (payout > 0) this.flash(won ? '¡Ganaste ' + this.fmt(payout) + '!' : 'Recuperas ' + this.fmt(payout));
    else if (lost)  this.flash(dealerBust ? 'El crupier se pasó… aún así perdiste' : 'Gana el crupier');

    this.phase = 'done';

    // Siguiente ronda
    this.nextRoundTimer = setTimeout(() => {
      this.hands = [{ cards: [], bet: 0, done: false, result: null }];
      this.dealer = { cards: [], hole: true };
      this.bots = this.bots.map(b => ({ ...b, bet: 0, cards: [], status: '', tone: 'dark', done: false }));
      this.myBet = 0;
      this.active = 0;
      this.count = 15;
      this.phase = 'bet';
      this.startCountdown();
    }, 2600);
  }

  // ── Status bajo tu mano ────────────────────────────────────
  get youStatus(): { t: string; c: string } | null {
    const h = this.hands[0];
    if (!h || h.cards.length === 0) return null;
    if (this.hands.length === 1) {
      if (h.result === 'bj' || isBlackjack(h.cards)) return { t: '¡BLACKJACK!', c: 'var(--gold-1)' };
      if (h.result === 'win')   return { t: 'GANAS', c: '#4fd190' };
      if (h.result === 'push')  return { t: 'EMPATE', c: 'var(--cream)' };
      if (h.result === 'lose')  return { t: handValue(h.cards).total > 21 ? 'TE PASASTE' : 'PIERDES', c: '#e06a6a' };
      if (h.result === 'surrender') return { t: 'TE RENDISTE', c: '#9a8a68' };
    }
    return null;
  }

  // ── Dealer helpers ─────────────────────────────────────────
  get dealerTone(): 'dark' | 'win' | 'bust' {
    if (!this.dealer.hole && handValue(this.dealer.cards).total > 21) return 'bust';
    return 'dark';
  }

  handTone(h: YouHand): 'dark' | 'win' | 'bust' {
    if (h.result === 'win' || h.result === 'bj') return 'win';
    if (h.result === 'lose') return 'bust';
    return 'dark';
  }

  isHandActive(i: number): boolean {
    return this.hands.length > 1 && i === this.active && this.phase === 'you';
  }

  isHandWin(h: YouHand): boolean {
    return h.result === 'win' || h.result === 'bj';
  }

  historyBg(h: number | string): string {
    if (h === 'BJ') return 'linear-gradient(180deg,#c79a32,#8a6a1e)';
    if (typeof h === 'number' && (h === 16 || h > 21)) return '#7a2620';
    return '#176b39';
  }

  // ── Nav ────────────────────────────────────────────────────
  go(to: string)       { this.router.navigate([to]); }
  goDeposito()         { this.router.navigate(['/deposito']); }
}