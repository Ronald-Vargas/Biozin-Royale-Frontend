import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_BITCOIN, ICON_PAYPAL } from 'src/app/User/shared/icons/icons';

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