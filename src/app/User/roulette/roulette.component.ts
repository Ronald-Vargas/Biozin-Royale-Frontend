import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AtmosphereComponent } from '../shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { ICON_TRASH, ICON_REFRESH, ICON_PLAY, ICON_SYNC, ICON_BACK } from '../shared/icons/icons';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { RouletteWheelComponent, numColor, REDS_EXP, rotationForWinning } from './Components/roulette-wheel/roulette-wheel.component';



interface Chip      { v: number; img: string; }
interface BetMap    { [key: string]: number; }
interface Toast     { msg: string; kind?: 'win' | 'lose'; }

const PAYOUT = { straight: 35, dozen: 2, column: 2, even: 1 };

@Component({
  standalone: true,
  imports: [
    CommonModule, IonicModule, AtmosphereComponent, SvgIconComponent,
    RouletteWheelComponent,
  ],
  selector: 'app-roulette',
  templateUrl: './roulette.component.html',
  styleUrls: ['./roulette.component.scss'],
})


export class RouletteComponent implements OnInit, OnDestroy {
  iconBack   = ICON_BACK;
  iconTrash   = ICON_TRASH;
  iconRefresh = ICON_REFRESH;
  iconPlay    = ICON_PLAY;
  iconSync    = ICON_SYNC;

  balance  = 1250;
  chip     = 5;
  bets: BetMap = {};
  rotation = 0;
  spinning = false;
  last: number | null = null;
  history: number[] = [];
  toast: Toast | null = null;

  private lastBets: BetMap = {};
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private spinTimer:  ReturnType<typeof setTimeout> | null = null;

  // Mesa: 3 filas (top, middle, bottom)
  topRow = Array.from({ length: 12 }, (_, k) => 3 * (k + 1));
  midRow = Array.from({ length: 12 }, (_, k) => 3 * (k + 1) - 1);
  botRow = Array.from({ length: 12 }, (_, k) => 3 * (k + 1) - 2);
  get gridNums(): number[] { return [...this.topRow, ...this.midRow, ...this.botRow]; }

  columns = ['c3', 'c2', 'c1'];

  chips: Chip[] = [
    { v: 1,   img: 'assets/chip-1.png' },
    { v: 5,   img: 'assets/chip-5.png' },
    { v: 10,  img: 'assets/chip-10.png' },
    { v: 25,  img: 'assets/chip-25.png' },
    { v: 100, img: 'assets/chip-100.png' },
  ];

  constructor(
    private router: Router,
    private balanceService: BalanceService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (this.authService.currentProfile()?.isGuest) {
      this.balance = 0;
    } else {
      this.balanceService.fetch().subscribe(b => { this.balance = b; });
    }
  }

  ngOnDestroy() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.spinTimer)  clearTimeout(this.spinTimer);
  }

  // ── State helpers ──────────────────────────────────────────
  get total(): number {
    return Object.values(this.bets).reduce((a, b) => a + b, 0);
  }

  betOn(id: string): number | undefined { return this.bets[id]; }
  hasLastBets(): boolean { return Object.keys(this.lastBets).length > 0; }

  numColor(n: number): 'red' | 'black' | 'green' { return numColor(n); }
  isRed(n: number): boolean   { return REDS_EXP.has(n); }

  cellBg(n: number): string {
    if (n === 0) return 'linear-gradient(180deg,#1f8a4c,#136033)';
    return REDS_EXP.has(n)
      ? 'linear-gradient(180deg,#c0392b,#8e1f17)'
      : 'linear-gradient(180deg,#23201a,#100d09)';
  }

  histBg(n: number): string {
    if (n === 0) return '#1f8a4c';
    return REDS_EXP.has(n) ? '#c0392b' : '#15110c';
  }

  // ── Money format ───────────────────────────────────────────
  fmtMoney(n: number): string {
    return '$' + n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ── Actions ────────────────────────────────────────────────
  place(id: string) {
    if (this.spinning) return;
    if (this.total + this.chip > this.balance) {
      this.flash('Saldo insuficiente');
      return;
    }
    this.bets = { ...this.bets, [id]: (this.bets[id] || 0) + this.chip };
  }

  selectChip(v: number) { this.chip = v; }

  clearBets() {
    if (this.spinning) return;
    this.bets = {};
  }

  rebet() {
    if (this.spinning) return;
    if (Object.keys(this.lastBets).length === 0) return;
    this.bets = { ...this.lastBets };
  }

  goBack() { this.router.navigate(['/home']); }

  // ── Toast ──────────────────────────────────────────────────
  flash(msg: string, kind?: 'win' | 'lose') {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { msg, kind };
    this.toastTimer = setTimeout(() => this.toast = null, 1800);
  }

  // ── Spin ───────────────────────────────────────────────────
  spin() {
    if (this.spinning || this.total === 0) return;
    if (this.authService.currentProfile()?.isGuest) {
      this.router.navigate(['/auth/register'], { queryParams: { motivo: 'invitado' } });
      return;
    }

    const w = Math.floor(Math.random() * 37);
    this.lastBets = { ...this.bets };
    this.spinning = true;

    // Descuenta apuesta al girar
    this.balance -= this.total;
    this.saveBalance();

    this.rotation = rotationForWinning(this.rotation, w);

    this.spinTimer = setTimeout(() => this.resolveSpin(w), 5300);
  }

  private resolveSpin(w: number) {
    let returnAmount = 0;

    Object.entries(this.bets).forEach(([id, stake]) => {
      if (this.betWins(id, w)) {
        returnAmount += stake * (this.betPayout(id) + 1);
      }
    });

    this.balance += returnAmount;
    this.saveBalance();

    this.last    = w;
    this.history = [w, ...this.history].slice(0, 12);
    this.spinning = false;
    this.bets = {};

    if (returnAmount > 0) {
      this.flash('¡Ganaste ' + this.fmtMoney(returnAmount) + '!', 'win');
    } else {
      this.flash('Salió el ' + w, 'lose');
    }
  }

  private saveBalance() {
    this.balanceService.save(this.balance).subscribe();
  }

  // ── Bet resolution ─────────────────────────────────────────
  private betWins(id: string, w: number): boolean {
    if (/^\d+$/.test(id)) return parseInt(id, 10) === w;
    switch (id) {
      case 'red':   return numColor(w) === 'red';
      case 'black': return numColor(w) === 'black';
      case 'even':  return w !== 0 && w % 2 === 0;
      case 'odd':   return w % 2 === 1;
      case 'low':   return w >= 1  && w <= 18;
      case 'high':  return w >= 19 && w <= 36;
      case 'd1':    return w >= 1  && w <= 12;
      case 'd2':    return w >= 13 && w <= 24;
      case 'd3':    return w >= 25 && w <= 36;
      case 'c1':    return w !== 0 && w % 3 === 1;
      case 'c2':    return w !== 0 && w % 3 === 2;
      case 'c3':    return w !== 0 && w % 3 === 0;
      default:      return false;
    }
  }

  private betPayout(id: string): number {
    if (/^\d+$/.test(id)) return PAYOUT.straight;
    if (id[0] === 'd')    return PAYOUT.dozen;
    if (id[0] === 'c')    return PAYOUT.column;
    return PAYOUT.even;
  }
}