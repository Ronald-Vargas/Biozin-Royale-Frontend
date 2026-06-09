import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ICON_TROPHY, ICON_SYNC_CIRCLE, ICON_WALLET_FILLED, ICON_CALENDAR,
} from '../../../shared/icons/icons';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

export interface HistBonus {
  title:  string;
  desc:   string;
  status: 'activo' | 'usado' | 'expirado';
  date:   string;
  icon:   string;
}

interface StatusMeta { label: string; color: string; }

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-bonus-hist-card',
  templateUrl: './bonus-hist-card.component.html',
  styleUrls: ['./bonus-hist-card.component.scss'],
})
export class BonusHistCardComponent {
  @Input() bonus!: HistBonus;

  private statusMeta: Record<string, StatusMeta> = {
    activo:   { label: 'Activo',   color: '#4fd190' },
    usado:    { label: 'Usado',    color: 'var(--gold-1)' },
    expirado: { label: 'Expirado', color: '#9a8a68' },
  };

  private iconMap: Record<string, string> = {
    trophy:        ICON_TROPHY,
    'sync-circle': ICON_SYNC_CIRCLE,
    wallet:        ICON_WALLET_FILLED,
    calendar:      ICON_CALENDAR,
  };

  get svg(): string  { return this.iconMap[this.bonus.icon] || ICON_TROPHY; }
  get meta(): StatusMeta { return this.statusMeta[this.bonus.status]; }
  get dim(): boolean { return this.bonus.status === 'expirado'; }
}