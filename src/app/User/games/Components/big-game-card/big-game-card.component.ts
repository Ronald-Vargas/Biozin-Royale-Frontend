import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../shared/components/svg-icons/svg-icon.component';
import {
  ICON_ICECREAM, ICON_FLASH, ICON_SKULL, ICON_CUBE,
  ICON_APERTURE, ICON_ALBUMS, ICON_DIAMOND, ICON_LAYERS, ICON_SYNC_CIRCLE,
} from '../../../shared/icons/icons';

export interface GameItem {
  name: string;
  cat:  'slots' | 'mesa' | 'live';
  icon: string;
  g1:   string;
  g2:   string;
  ic:   string;
}

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-big-game-card',
  templateUrl: './big-game-card.component.html',
  styleUrls: ['./big-game-card.component.scss'],
})
export class BigGameCardComponent {
  @Input() game!: GameItem;

  private iconMap: Record<string, string> = {
    'ice-cream':   ICON_ICECREAM,
    'flash':       ICON_FLASH,
    'skull':       ICON_SKULL,
    'cube':        ICON_CUBE,
    'aperture':    ICON_APERTURE,
    'albums':      ICON_ALBUMS,
    'diamond':     ICON_DIAMOND,
    'layers':      ICON_LAYERS,
    'sync-circle': ICON_SYNC_CIRCLE,
  };

  get svg(): string {
    return this.iconMap[this.game.icon] || ICON_CUBE;
  }

  get artBg(): string {
    return `radial-gradient(130% 100% at 50% 0%, ${this.game.g1}, ${this.game.g2})`;
  }
}