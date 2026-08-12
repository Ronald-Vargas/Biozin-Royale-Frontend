import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatBadgeComponent } from '../seat-badge/seat-badge.component';
import { SeatSpotComponent }  from '../seat-spot/seat-spot.component';
import { ChipTokenComponent } from '../chip-token/chip-token.component';
import { HandComponent } from '../../Cards/hand/hand.component';
import { Card } from '../../Cards/cards.logic';

export interface Bot {
  name:    string;
  balance: number;
  tint:    string;
  avatar:  string;
  bet:     number;
  cards:   Card[];
  status:  string;
  tone:    'dark' | 'win' | 'bust';
  done?:   boolean;
  /** Silla real (0-3) que ocupa este asiento visual; null si está vacío */
  chair?:  number | null;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, SeatBadgeComponent, SeatSpotComponent,
    ChipTokenComponent, HandComponent,
  ],
  selector: 'app-bot-seat',
  templateUrl: './bot-seat.component.html',
  styleUrls: ['./bot-seat.component.scss'],
})
export class BotSeatComponent {
  @Input() bot!: Bot;
  @Input() num = 1;
  @Input() align: 'left' | 'right' = 'left';
  /** Burbuja de chat rápido; null = sin mensaje activo */
  @Input() chatBubble: string | null = null;

  get isRight(): boolean { return this.align === 'right'; }
  get win(): boolean { return this.bot.tone === 'win'; }

  get statusColor(): string {
    const s = this.bot.status;
    if (s === 'PLANTARSE' || s === 'GANA')     return '#4fd190';
    if (s === 'PIERDE' || s === 'SE PASA')     return '#e06a6a';
    if (s === '¡BLACKJACK!')                   return 'var(--gold-1)';
    return 'var(--gold-2)';
  }
}