import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { ICON_DIAMOND, ICON_MINUS, ICON_ADD, ICON_FLASH, ICON_SYNC, ICON_REFRESH, ICON_INFO, ICON_BACK } from '../shared/icons/icons';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { SlotsService } from 'src/app/Core/Services/slots.service';
import { EmblemComponent } from './Components/emblem/emblem.component';
import { GemDefsComponent } from './Components/gem-defs/gem-defs.component';
import { GemComponent } from './Components/gem/gem.component';
import { PaytableModalComponent } from './Components/paytable-modal/paytable-modal.component';
import { ROWS, COLS, randomSym, glowColor, LINES } from './slots.symbols';

interface Reel { strip: string[]; offset: number; dur: number; spinning: boolean; }

const CELL      = 64;
const PAD       = 16;
// Strip de giro: 8 símbolos base + 4 repetidos al final → loop sin costura
const SPIN_BASE = ROWS * 2;
const BET_STEPS = [5, 10, 20, 50, 100, 200];

@Component({
  standalone: true,
  imports: [
    CommonModule, IonicModule, SvgIconComponent,
    GemDefsComponent, GemComponent, EmblemComponent, PaytableModalComponent,
  ],
  selector: 'app-slots',
  templateUrl: './slots.component.html',
  styleUrls: ['./slots.component.scss'],
})
export class SlotsComponent implements OnInit, OnDestroy {
  iconBack    = ICON_BACK;
  iconDiamond = ICON_DIAMOND;
  iconMinus   = ICON_MINUS;
  iconAdd     = ICON_ADD;
  iconFlash   = ICON_FLASH;
  iconSync    = ICON_SYNC;
  iconRefresh = ICON_REFRESH;
  iconInfo    = ICON_INFO;

  balance    = 0;
  betIdx     = 1;
  reels: Reel[] = [];
  winCells   = new Set<string>();
  spinning   = false;
  win        = 0;
  bigWin     = false;
  turbo      = false;
  showInfo   = false;
  balanceWin = false;

  readonly cell     = CELL;
  readonly rows     = ROWS;
  readonly cols     = COLS;
  readonly betSteps = BET_STEPS;

  private lockRef   = false;
  private destroyed = false;
  // Estado interno por carrete (fuente de verdad, sin race conditions)
  private reelData: Reel[] = [];

  constructor(
    private router: Router,
    private balanceService: BalanceService,
    private slotsService: SlotsService,
  ) {}

  ngOnInit() {
    this.balanceService.fetch().subscribe(b => { this.balance = b; });
    this.reelData = Array.from({ length: COLS }, () => ({
      strip: Array.from({ length: ROWS }, () => randomSym()),
      offset: 0,
      dur: 0,
      spinning: false,
    }));
    this.syncReels();
  }

  ngOnDestroy() { this.destroyed = true; }

  // Publica reelData → this.reels (único punto de escritura al template)
  private syncReels() {
    this.reels = this.reelData.map(r => ({ ...r }));
  }

  get bet(): number { return BET_STEPS[this.betIdx]; }
  get reelHeight(): number { return ROWS * CELL; }

  fmtMoney(n: number): string {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  glowFor(sym: string): string { return glowColor(sym); }

  isWinCell(c: number, idx: number): boolean {
    return idx < ROWS && this.winCells.has(c + '_' + idx);
  }

  reelTransform(rl: Reel): string { return `translateY(${rl.offset * CELL}px)`; }

  reelTransition(rl: Reel): string {
    return rl.dur ? `transform ${rl.dur}ms cubic-bezier(.16,.62,.18,1)` : 'none';
  }

  trackByIndex(index: number): number { return index; }

  changeBet(d: number) {
    if (this.spinning) return;
    this.betIdx = Math.max(0, Math.min(BET_STEPS.length - 1, this.betIdx + d));
  }

  async spin() {
    if (this.lockRef || this.spinning || this.balance < this.bet) return;
    this.lockRef  = true;
    const isTurbo = this.turbo;

    this.spinning   = true;
    this.win        = 0;
    this.bigWin     = false;
    this.winCells   = new Set();
    this.balanceWin = false;

    // API y animación arrancan al mismo tiempo
    const spinCall = firstValueFrom(this.slotsService.spin(this.bet));

    // Todos los carretes entran en modo giro continuo (CSS infinite animation)
    this.reelData = Array.from({ length: COLS }, () => ({
      strip: this.spinningStrip(),
      offset: 0,
      dur: 0,
      spinning: true,
    }));
    this.syncReels();

    // Esperar la API (los carretes siguen girando mientras tanto)
    const response = await spinCall;
    if (this.destroyed) return;

    if (!response.blnError && response.returnValue) {
      const { grid, win, newBalance } = response.returnValue;

      // Mostrar balance post-apuesta de inmediato
      this.balance = Math.round((newBalance - win) * 100) / 100;
      this.balanceService.set(this.balance);

      // Detener carretes de izq → der con escalonamiento
      const stopGap = isTurbo ? 150 : 280;
      await Promise.all(
        grid.map((col, c) =>
          this.wait(c * stopGap).then(() => this.stopReel(c, col))
        )
      );

      if (this.destroyed) return;
      this.spinning = false;

      if (win > 0) {
        // Marcar líneas ganadoras
        this.winCells = new Set<string>();
        for (const hit of response.returnValue.hits) {
          const line = LINES[hit.lineIndex];
          for (let c = 0; c < hit.length; c++) {
            this.winCells.add(`${c}_${line[c]}`);
          }
        }
        this.bigWin     = response.returnValue.bigWin;
        this.balanceWin = true;
        await this.animateCounters(this.balance, win, newBalance);
        this.balanceWin = false;
      }
    } else {
      // Error: detener todos sin resultado y refrescar balance
      this.reelData.forEach((r, c) => {
        this.reelData[c] = { ...r, spinning: false };
      });
      this.syncReels();
      this.spinning = false;
      this.balanceService.reload();
      this.balanceService.fetch().subscribe(b => { this.balance = b; });
    }

    this.lockRef = false;
  }

  // Strip con loop sin costura: 8 símbolos base + los primeros 4 repetidos al final.
  // La animación CSS recorre exactamente los 8 base → al reiniciar muestra los mismos 4 iniciales.
  private spinningStrip(): string[] {
    const base = Array.from({ length: SPIN_BASE }, () => randomSym());
    return [...base, ...base.slice(0, ROWS)];
  }

  // Detiene un carrete y lo hace aterrizar en los símbolos del servidor.
  private async stopReel(c: number, serverSymbols: string[]) {
    const strip = [...serverSymbols, ...Array.from({ length: PAD }, () => randomSym())];

    // Quitar animación CSS, posicionar strip en la parte baja sin transición
    this.reelData[c] = { strip, offset: -(strip.length - ROWS), dur: 0, spinning: false };
    this.syncReels();

    await this.wait(30); // un frame para que Angular aplique la posición inicial

    // Animar hacia arriba: símbolos del servidor suben a la vista
    this.reelData[c] = { ...this.reelData[c], offset: 0, dur: 600 };
    this.syncReels();

    await this.wait(650);
  }

  private async animateCounters(balanceFrom: number, winTarget: number, balanceTo: number) {
    const totalMs = 1100;
    const tickMs  = 16;
    const ticks   = Math.ceil(totalMs / tickMs);

    for (let i = 1; i <= ticks; i++) {
      const t    = i / ticks;
      const ease = 1 - Math.pow(1 - t, 3);
      this.win     = +(winTarget * ease).toFixed(2);
      this.balance = +(balanceFrom + (balanceTo - balanceFrom) * ease).toFixed(2);
      await this.wait(tickMs);
    }
    this.win     = winTarget;
    this.balance = balanceTo;
    this.balanceService.set(balanceTo);
  }

  private wait(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  toggleTurbo() { this.turbo = !this.turbo; }
  openInfo()    { this.showInfo = true; }
  closeInfo()   { this.showInfo = false; }
  goBack()      { this.router.navigate(['/home']); }
}
