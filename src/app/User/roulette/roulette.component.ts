import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AtmosphereComponent } from '../shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { ICON_TRASH, ICON_REFRESH, ICON_PLAY, ICON_SYNC, ICON_BACK, ICON_INFO } from '../shared/icons/icons';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { RuletaService } from 'src/app/Core/Services/ruleta.service';
import { RouletteWheelComponent, numColor, REDS_EXP, rotationForWinning } from './Components/roulette-wheel/roulette-wheel.component';
import { RoulettePaytableComponent } from './Components/roulette-paytable/roulette-paytable.component';

interface Chip   { v: number; img: string; }
interface BetMap { [key: string]: number; }
interface Toast  { msg: string; kind?: 'win' | 'lose'; }

@Component({
  standalone: true,
  imports: [
    CommonModule, IonicModule, AtmosphereComponent, SvgIconComponent,
    RouletteWheelComponent, RoulettePaytableComponent,
  ],
  selector: 'app-roulette',
  templateUrl: './roulette.component.html',
  styleUrls: ['./roulette.component.scss'],
})
export class RouletteComponent implements OnInit, OnDestroy {
  iconBack    = ICON_BACK;
  iconTrash   = ICON_TRASH;
  iconRefresh = ICON_REFRESH;
  iconPlay    = ICON_PLAY;
  iconSync    = ICON_SYNC;
  iconInfo    = ICON_INFO;

  readonly balance = this.balanceService.balance;

  showPaytable    = false;
  chip            = 5;
  bets: BetMap    = {};
  rotation        = 0;
  spinning        = false;
  wheelFreeSpinning = false;
  last: number | null = null;
  history: number[] = [];
  toast: Toast | null = null;

  private lastBets: BetMap = {};
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private spinTimer:  ReturnType<typeof setTimeout> | null = null;
  private rafId: number | null = null;

  topRow = Array.from({ length: 12 }, (_, k) => 3 * (k + 1));
  midRow = Array.from({ length: 12 }, (_, k) => 3 * (k + 1) - 1);
  botRow = Array.from({ length: 12 }, (_, k) => 3 * (k + 1) - 2);
  get gridNums(): number[] { return [...this.topRow, ...this.midRow, ...this.botRow]; }

  columns = ['c3', 'c2', 'c1'];

  chips: Chip[] = [
    { v: 1,   img: 'assets/chip-1.png'   },
    { v: 5,   img: 'assets/chip-5.png'   },
    { v: 10,  img: 'assets/chip-10.png'  },
    { v: 25,  img: 'assets/chip-25.png'  },
    { v: 100, img: 'assets/chip-100.png' },
  ];

  constructor(
    private router: Router,
    private balanceService: BalanceService,
    private authService: AuthService,
    private ruletaService: RuletaService,
  ) {}

  ngOnInit() {
    if (this.authService.currentProfile()?.isGuest) {
      this.balanceService.set(0);
    } else {
      this.balanceService.load();
    }
  }

  ngOnDestroy() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.spinTimer)  clearTimeout(this.spinTimer);
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  get total(): number {
    return Object.values(this.bets).reduce((a, b) => a + b, 0);
  }

  get currentBalance(): number { return this.balance() ?? 0; }

  betOn(id: string): number | undefined { return this.bets[id]; }
  hasLastBets(): boolean { return Object.keys(this.lastBets).length > 0; }

  numColor(n: number): 'red' | 'black' | 'green' { return numColor(n); }
  isRed(n: number): boolean { return REDS_EXP.has(n); }

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

  fmtMoney(n: number): string {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  place(id: string) {
    if (this.spinning) return;
    if (this.total + this.chip > this.currentBalance) {
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
    const rebetTotal = Object.values(this.lastBets).reduce((a, b) => a + b, 0);
    if (rebetTotal > this.currentBalance) {
      this.flash('Saldo insuficiente para repetir');
      return;
    }
    this.bets = { ...this.lastBets };
  }

  goBack()         { this.router.navigate(['/home']); }
  openPaytable()   { this.showPaytable = true; }
  closePaytable()  { this.showPaytable = false; }

  flash(msg: string, kind?: 'win' | 'lose') {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { msg, kind };
    this.toastTimer = setTimeout(() => this.toast = null, 1800);
  }

  async spin(): Promise<void> {
    if (this.spinning || this.total === 0) return;
    if (this.authService.currentProfile()?.isGuest) {
      this.router.navigate(['/auth/register'], { queryParams: { motivo: 'invitado' } });
      return;
    }

    this.spinning         = true;
    this.wheelFreeSpinning = true;
    this.lastBets         = { ...this.bets };

    // Rueda empieza a girar inmediatamente
    this.startFreeSpin();

    try {
      const res = await firstValueFrom(this.ruletaService.spin(this.bets));

      if (res.blnError || !res.returnValue) {
        this.cancelFreeSpin();
        this.spinning = false;
        this.flash(res.strResponseMessage || 'Error al girar. Intentá de nuevo.', 'lose');
        return;
      }

      const { winningNumber, win, newBalance } = res.returnValue;

      // Detiene el giro libre y lanza la desaceleración hacia el número ganador
      this.stopFreeSpinAt(winningNumber);
      this.bets = {};

      this.spinTimer = setTimeout(() => {
        this.last    = winningNumber;
        this.history = [winningNumber, ...this.history].slice(0, 12);
        this.spinning = false;
        this.balanceService.set(newBalance);

        if (win > 0) {
          this.flash('¡Ganaste ' + this.fmtMoney(win) + '!', 'win');
        } else {
          this.flash('Salió el ' + winningNumber, 'lose');
        }
      }, 5300);

    } catch {
      this.cancelFreeSpin();
      this.spinning = false;
      this.flash('Error de conexión. Intentá de nuevo.', 'lose');
    }
  }

  // ── RAF free-spin ──────────────────────────────────────────
  private startFreeSpin() {
    const tick = () => {
      this.rotation += 11; // ~660°/s a 60fps
      if (this.wheelFreeSpinning) {
        this.rafId = requestAnimationFrame(tick);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopFreeSpinAt(winningNumber: number) {
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    // Quita la flag en el frame actual → Angular elimina transition:none del DOM
    this.wheelFreeSpinning = false;
    // En el siguiente frame el transition CSS ya está activo → lanza la animación de parada
    requestAnimationFrame(() => {
      this.rotation = rotationForWinning(this.rotation, winningNumber);
    });
  }

  private cancelFreeSpin() {
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this.wheelFreeSpinning = false;
  }
}
