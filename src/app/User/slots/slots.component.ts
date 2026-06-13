import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AtmosphereComponent } from '../shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { ICON_DIAMOND, ICON_MINUS, ICON_ADD, ICON_FLASH, ICON_SYNC, ICON_REFRESH, ICON_INFO, ICON_BACK } from '../shared/icons/icons';
import { EmblemComponent } from './Components/emblem/emblem.component';
import { GemDefsComponent } from './Components/gem-defs/gem-defs.component';
import { GemComponent } from './Components/gem/gem.component';
import { PaytableModalComponent } from './Components/paytable-modal/paytable-modal.component';
import { ROWS, COLS, randomSym, glowColor, LINES, SYMBOLS, LEN_FACTOR } from './slots.symbols';


interface Reel    { strip: string[]; offset: number; dur: number; }
interface Hit     { li: number; len: number; sym: string; amt: number; }

const CELL       = 64;
const PAD        = 16;
const BET_STEPS  = [5, 10, 20, 50, 100, 200];

@Component({
  standalone: true,
  imports: [
    CommonModule, IonicModule, AtmosphereComponent, SvgIconComponent,
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

  balance  = 1250;
  betIdx   = 1;
  reels: Reel[] = [];
  winCells = new Set<string>();
  spinning = false;
  win      = 0;
  bigWin   = false;
  turbo    = false;
  showInfo = false;

  // Constantes para el template
  readonly cell = CELL;
  readonly rows = ROWS;
  readonly cols = COLS;
  readonly betSteps = BET_STEPS;

  private lockRef = false;

  constructor(
    private router: Router, 
  ) {}

  ngOnInit() {
    const stored = parseFloat(localStorage.getItem('biozin_balance') || '');
    if (!isNaN(stored)) this.balance = stored;

    this.reels = Array.from({ length: COLS }, () => ({
      strip: [...this.randCol(), ...Array.from({ length: PAD }, () => randomSym())],
      offset: 0,
      dur: 0,
    }));
  }

  ngOnDestroy() {}

  // ── Getters ────────────────────────────────────────────────
  get bet(): number { return BET_STEPS[this.betIdx]; }

  get reelHeight(): number { return ROWS * CELL; }

  fmtMoney(n: number): string {
    return '$' + n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  glowFor(sym: string): string { return glowColor(sym); }

  isWinCell(c: number, idx: number): boolean {
    return idx < ROWS && this.winCells.has(c + '_' + idx);
  }

  reelTransform(rl: Reel): string {
    return `translateY(${rl.offset * CELL}px)`;
  }

  reelTransition(rl: Reel): string {
    return rl.dur ? `transform ${rl.dur}ms cubic-bezier(.16,.62,.18,1)` : 'none';
  }

  trackByIndex(index: number): number { return index; }

  // ── Bet ────────────────────────────────────────────────────
  changeBet(d: number) {
    if (this.spinning) return;
    this.betIdx = Math.max(0, Math.min(BET_STEPS.length - 1, this.betIdx + d));
  }

  // ── Spin ───────────────────────────────────────────────────
  async spin() {
    if (this.lockRef || this.spinning || this.balance < this.bet) return;
    this.lockRef = true;
    const isTurbo = this.turbo;

    this.spinning = true;
    this.win = 0;
    this.bigWin = false;
    this.winCells = new Set();
    this.balance = +Math.max(0, this.balance - this.bet).toFixed(2);
    this.saveBalance();

    // Generar resultado
    const grid: string[][] = Array.from({ length: COLS }, () => this.randCol());

    const baseDur = isTurbo ? 620 : 1150;
    const step    = isTurbo ? 130 : 280;

    // PASO 1: nuevos strips con offset al fondo, sin transición
    this.reels = grid.map(col => {
      const strip = [...col, ...Array.from({ length: PAD }, () => randomSym())];
      return { strip, offset: -(strip.length - ROWS), dur: 0 };
    });

    // PASO 2: esperar a que se pinte ese estado y luego animar a offset 0
    setTimeout(() => {
      const durs = grid.map((_, c) => baseDur + c * step);
      this.reels = this.reels.map((rl, c) => ({ ...rl, offset: 0, dur: durs[c] }));
    }, 50);

    // PASO 3: esperar a que termine la última animación
    const totalWait = baseDur + step * (COLS - 1) + 140 + 50;
    await this.wait(totalWait);

    // Evaluar
    const { win, cells, hits } = this.evalLines(grid, this.bet);
    if (win > 0) {
      this.winCells = cells;
      this.win = win;
      this.balance = +(this.balance + win).toFixed(2);
      this.saveBalance();
      if (hits.some(h => h.len >= 4) || win >= this.bet * 8) {
        this.bigWin = true;
      }
    }

    this.spinning = false;
    this.lockRef = false;
  }

  // ── Helpers ────────────────────────────────────────────────
  private randCol(): string[] {
    return Array.from({ length: ROWS }, () => randomSym());
  }


  private wait(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  private saveBalance() {
    localStorage.setItem('biozin_balance', String(this.balance));
  }

  private evalLines(grid: string[][], bet: number): { win: number; cells: Set<string>; hits: Hit[] } {
    let win = 0;
    const cells = new Set<string>();
    const hits: Hit[] = [];

    LINES.forEach((line, li) => {
      const first = grid[0][line[0]];
      let len = 1;
      for (let c = 1; c < COLS; c++) {
        if (grid[c][line[c]] === first) len++;
        else break;
      }
      if (len >= 3) {
        const amt = bet * SYMBOLS[first].mult * LEN_FACTOR[len];
        win += amt;
        for (let c = 0; c < len; c++) {
          cells.add(c + '_' + line[c]);
        }
        hits.push({ li, len, sym: first, amt });
      }
    });

    return { win: +win.toFixed(2), cells, hits };
  }

  // ── Actions ────────────────────────────────────────────────
  toggleTurbo() { this.turbo = !this.turbo; }
  openInfo()    { this.showInfo = true; }
  closeInfo()   { this.showInfo = false; }
  goBack()      { this.router.navigate(['/home']); }
}