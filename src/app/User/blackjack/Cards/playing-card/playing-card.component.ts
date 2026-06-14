import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, SUIT_GLYPH, SUIT_RED } from '../cards.logic';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-playing-card',
  templateUrl: './playing-card.component.html',
  styleUrls: ['./playing-card.component.scss'],
})
export class PlayingCardComponent {
  @Input() card!: Card;
  @Input() w = 46;
  @Input() faceDown = false;
  @Input() dealAnim = false;
  @Input() idx = 0;

  get h(): number { return this.w * 1.4; }
  get red(): boolean { return !!(this.card && SUIT_RED[this.card.s]); }
  get glyph(): string { return this.card ? SUIT_GLYPH[this.card.s] : ''; }
  get color(): string { return this.red ? '#c0202b' : '#1a1a1f'; }

  get cardStyle(): { [k: string]: string } {
    return {
      width:        this.w + 'px',
      height:       this.h + 'px',
      'border-radius': (this.w * 0.13) + 'px',
      'animation':  this.dealAnim
        ? `cardDeal .34s cubic-bezier(.2,.8,.3,1) ${this.idx * 0.08}s both`
        : 'none',
    };
  }

  // tamaños relativos al ancho
  get rankSize(): string  { return (this.w * 0.3) + 'px'; }
  get suitSize(): string  { return (this.w * 0.26) + 'px'; }
  get pipSize(): string   { return (this.w * 0.6) + 'px'; }
  get pad(): string       { return (this.w * 0.06) + 'px'; }
  get padX(): string      { return (this.w * 0.09) + 'px'; }
  get borderW(): string   { return Math.max(1.5, this.w * 0.04) + 'px'; }
  get backRadius(): string { return (this.w * 0.08) + 'px'; }
  get backFont(): string  { return (this.w * 0.34) + 'px'; }
}