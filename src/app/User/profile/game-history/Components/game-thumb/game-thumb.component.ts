import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../shared/components/svg-icons/svg-icon.component';
import {
  ICON_APERTURE, ICON_ALBUMS, ICON_CUBE, ICON_FLASH, ICON_STAR, ICON_SYNC_CIRCLE,
} from '../../../shared/icons/icons';

export interface GameHist {
  name:   string;
  cat:    string;
  date:   string;
  time:   string;
  bet:    number;
  result: number;
  g1:     string;
  g2:     string;
  ic:     string;
  icon:   string;
}

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-game-thumb',
  templateUrl: './game-thumb.component.html',
  styleUrls: ['./game-thumb.component.scss'],
})
export class GameThumbComponent {
  @Input() game!: GameHist;

  private iconMap: Record<string, string> = {
    'aperture':    ICON_APERTURE,
    'albums':      ICON_ALBUMS,
    'cube':        ICON_CUBE,
    'flash':       ICON_FLASH,
    'star':        ICON_STAR,
    'sync-circle': ICON_SYNC_CIRCLE,
  };

  get svg(): string {
    return this.iconMap[this.game.icon] || ICON_CUBE;
  }

  get bg(): string {
    return `radial-gradient(130% 100% at 50% 0%, ${this.game.g1}, ${this.game.g2})`;
  }
}