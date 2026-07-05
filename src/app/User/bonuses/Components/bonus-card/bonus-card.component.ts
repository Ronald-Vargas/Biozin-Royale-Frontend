import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICON_TROPHY, ICON_SHIELD, ICON_TIME } from '../../../shared/icons/icons';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

export interface ActiveBonus {
  id?:    string;
  title: string;
  desc:  string;
  time:  string;
  icon:  string;
}

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-bonus-card',
  templateUrl: './bonus-card.component.html',
  styleUrls: ['./bonus-card.component.scss'],
})
export class BonusCardComponent {
  @Input() bonus!: ActiveBonus;
  @Output() viewDetails = new EventEmitter<string>();

  iconTime = ICON_TIME;

  private iconMap: Record<string, string> = {
    trophy: ICON_TROPHY,
    shield: ICON_SHIELD,
  };

  get svg(): string {
    return this.iconMap[this.bonus.icon] || ICON_TROPHY;
  }
}