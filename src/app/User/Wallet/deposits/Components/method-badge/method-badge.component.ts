import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../shared/components/svg-icons/svg-icon.component';
import { ICON_BITCOIN, ICON_PAYPAL } from '../../../shared/icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-method-badge',
  templateUrl: './method-badge.component.html',
  styleUrls: ['./method-badge.component.scss'],
})
export class MethodBadgeComponent {
  @Input() kind = '';

  iconBitcoin = ICON_BITCOIN;
  iconPaypal  = ICON_PAYPAL;
}