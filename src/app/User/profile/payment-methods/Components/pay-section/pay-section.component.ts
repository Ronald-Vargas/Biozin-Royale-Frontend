import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../shared/components/svg-icons/svg-icon.component';
import { ICON_ADD } from '../../../shared/icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-pay-section',
  templateUrl: './pay-section.component.html',
  styleUrls: ['./pay-section.component.scss'],
})
export class PaySectionComponent {
  @Input() icon     = '';
  @Input() title    = '';
  @Input() addLabel = '';

  iconAdd = ICON_ADD;
}