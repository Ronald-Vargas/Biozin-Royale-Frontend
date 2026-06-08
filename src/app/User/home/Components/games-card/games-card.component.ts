import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../shared/components/svg-icons/svg-icon.component';
import { ICON_SLOTS, ICON_ROULETTE, ICON_BLACKJACK } from '../../../shared/icons/icons';

export interface Game {
  name:  string;
  icon:  'slots' | 'roulette' | 'blackjack';
  g1:    string;
  g2:    string;
  ic:    string;
}

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
  @Input() game!: Game;

  private iconMap = {
    slots:     ICON_SLOTS,
    roulette:  ICON_ROULETTE,
    blackjack: ICON_BLACKJACK,
  };

  get svg(): string {
    return this.iconMap[this.game.icon];
  }
}