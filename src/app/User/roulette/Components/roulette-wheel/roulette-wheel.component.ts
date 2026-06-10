import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

const EU_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const SEG = 360 / 37;

interface Sector {
  n: number; i: number; a0: number; a1: number;
  col: 'red' | 'black' | 'green';
  lx: number; ly: number; ang: number;
  path: string;
  fill: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-roulette-wheel',
  templateUrl: './roulette-wheel.component.html',
  styleUrls: ['./roulette-wheel.component.scss'],
})
export class RouletteWheelComponent implements OnInit, OnChanges {
  @Input() rotation = 0;
  @Input() size     = 240;

  readonly C = 100;
  readonly rPocketOut = 88;
  readonly rPocketIn  = 60;
  readonly rLabel     = 74.5;

  sectors: Sector[] = [];
  arms = [0, 45, 90, 135, 180, 225, 270, 315];
  armKnobs: { x: number; y: number; rot: number }[] = [];

  ngOnInit() {
    this.buildSectors();
    this.buildKnobs();
  }

  ngOnChanges() { /* rotation reactivo via style binding */ }

  private buildSectors() {
    this.sectors = EU_ORDER.map((n, i) => {
      const a0  = i * SEG - SEG / 2;
      const a1  = i * SEG + SEG / 2;
      const col = n === 0 ? 'green' : (REDS.has(n) ? 'red' : 'black');
      const [lx, ly] = this.pt(this.C, this.C, this.rLabel, i * SEG);
      return {
        n, i, a0, a1, col,
        lx, ly,
        ang:  i * SEG,
        path: this.sectorPath(this.C, this.C, this.rPocketIn, this.rPocketOut, a0, a1),
        fill: col === 'red'   ? 'url(#rwRed)'
            : col === 'green' ? 'url(#rwGreen)'
            : 'url(#rwBlack)',
      };
    });
  }

  private buildKnobs() {
    this.armKnobs = this.arms.map(rot => {
      const [x, y] = this.pt(this.C, this.C, this.rPocketIn - 4, rot);
      return { x, y, rot };
    });
  }

  // helpers
  pt(cx: number, cy: number, r: number, ang: number): [number, number] {
    const rad = (ang - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  sectorPath(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number): string {
    const [x0o, y0o] = this.pt(cx, cy, r2, a0);
    const [x1o, y1o] = this.pt(cx, cy, r2, a1);
    const [x1i, y1i] = this.pt(cx, cy, r1, a1);
    const [x0i, y0i] = this.pt(cx, cy, r1, a0);
    const large = (a1 - a0) > 180 ? 1 : 0;
    return `M ${x0o} ${y0o} A ${r2} ${r2} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${r1} ${r1} 0 ${large} 0 ${x0i} ${y0i} Z`;
  }

  fretLine(s: Sector): { x1: number; y1: number; x2: number; y2: number } {
    const [x, y]   = this.pt(this.C, this.C, this.rPocketOut, s.a0);
    const [xi, yi] = this.pt(this.C, this.C, this.rPocketIn,  s.a0);
    return { x1: x, y1: y, x2: xi, y2: yi };
  }

  armPoints(): string {
    return `100,100 96.5,${100 - (this.rPocketIn - 6)} 100,${100 - (this.rPocketIn - 3)} 103.5,${100 - (this.rPocketIn - 6)}`;
  }

  get ballSize(): number { return this.size * 0.034; }
}

// Re-exports para usar en la página
export const EU_ORDER_EXP = EU_ORDER;
export const REDS_EXP     = REDS;
export const SEG_EXP      = SEG;

export function numColor(n: number): 'red' | 'black' | 'green' {
  if (n === 0) return 'green';
  return REDS.has(n) ? 'red' : 'black';
}

export function rotationForWinning(current: number, winning: number): number {
  const i = EU_ORDER.indexOf(winning);
  const targetMod = (360 - (i * SEG)) % 360;
  const curMod    = ((current % 360) + 360) % 360;
  let delta = targetMod - curMod;
  if (delta < 0) delta += 360;
  return current + 360 * 6 + delta;
}