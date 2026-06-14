import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayingCardComponent } from '../playing-card/playing-card.component';
import { TotalBadgeComponent }  from '../total-badge/total-badge.component';
import { Card, handValue } from '../cards.logic';

@Component({
  standalone: true,
  imports: [CommonModule, PlayingCardComponent, TotalBadgeComponent],
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss'],
})
export class HandComponent {
  @Input() cards: Card[] = [];
  @Input() w = 34;
  @Input() tone: 'dark' | 'win' | 'bust' = 'dark';
  @Input() hideHole = false;
  @Input() deal = false;

  get overlap(): number { return this.w * 0.42; }

  get badgeSize(): number { return this.w * 0.56; }

  // Total mostrado: si se oculta el hole, solo cuenta la primera carta
  get displayTotal(): number {
    const visible = this.hideHole ? this.cards.slice(0, 1) : this.cards;
    return handValue(visible).total;
  }

  // ¿Mostrar el badge? No si hay hole oculto con menos de 2 cartas
  get showBadge(): boolean {
    if (this.cards.length === 0) return false;
    if (this.hideHole && this.cards.length < 2) return false;
    return true;
  }

  isFaceDown(i: number): boolean {
    return this.hideHole && i === 1;
  }

  marginLeft(i: number): string {
    return i ? `${-this.overlap}px` : '0';
  }
}