import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHAPES, SYM_COLORS, GEM_SHAPE } from '../../slots.symbols';

interface LineCoords { x1: number; y1: number; x2: number; y2: number; }

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-facet-gem',
  templateUrl: './facet-gem.component.html',
  styleUrls: ['./facet-gem.component.scss'],
})
export class FacetGemComponent {
  @Input() colorKey = 'red';

  get shapeKey(): string { return GEM_SHAPE[this.colorKey] || 'hex'; }
  get shape()  { return SHAPES[this.shapeKey]; }
  get stroke(): string  { return SYM_COLORS[this.colorKey][2]; }
  get isRound(): boolean { return this.shapeKey === 'round'; }
  get fillBody(): string { return `url(#gem-${this.colorKey}-b)`; }
  get fillTable(): string { return `url(#gem-${this.colorKey}-t)`; }

  get lines(): LineCoords[] {
    return this.shape.lines.map(l => ({ x1: l[0], y1: l[1], x2: l[2], y2: l[3] }));
  }
}