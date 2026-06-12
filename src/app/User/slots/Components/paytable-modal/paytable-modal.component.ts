import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GemComponent } from '../gem/gem.component';
import { SvgIconComponent } from '../../../shared/components/svg-icon/svg-icon.component';
import {
  SYMBOLS, SYM_NAMES, PAY_ORDER, LINES, LEN_FACTOR, COLS, ROWS, glowColor,
} from '../../slots.symbols';
import { ICON_CLOSE } from '../../../shared/icons/icons';

interface PayRow { sym: string; name: string; x3: string; x4: string; glow: string; }
interface LinePreview { idx: number; cells: boolean[]; }

@Component({
  standalone: true,
  imports: [CommonModule, GemComponent, SvgIconComponent],
  selector: 'app-paytable-modal',
  templateUrl: './paytable-modal.component.html',
  styleUrls: ['./paytable-modal.component.scss'],
})
export class PaytableModalComponent {
  @Output() closed = new EventEmitter<void>();

  iconClose = ICON_CLOSE;

  payRows: PayRow[] = PAY_ORDER.map(sym => ({
    sym,
    name: SYM_NAMES[sym],
    x3:   this.fmtX(SYMBOLS[sym].mult * LEN_FACTOR[3]),
    x4:   this.fmtX(SYMBOLS[sym].mult * LEN_FACTOR[4]),
    glow: glowColor(sym),
  }));

  linePreviews: LinePreview[] = LINES.map((line, idx) => {
    const cells: boolean[] = [];
    for (let i = 0; i < ROWS * COLS; i++) {
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      cells.push(line[c] === r);
    }
    return { idx: idx + 1, cells };
  });

  fmtX(n: number): string {
    return '×' + (Number.isInteger(n) ? n : +n.toFixed(1));
  }

  close()           { this.closed.emit(); }
  stop(e: Event)    { e.stopPropagation(); }
}