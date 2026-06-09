import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_CARD, ICON_BITCOIN, ICON_PAYPAL, ICON_STAR, ICON_SHIELD_CHECK } from '../../shared/icons/icons';
import { KebabComponent } from './Components/kebab/kebab.component';
import { PaySectionComponent } from './Components/pay-section/pay-section.component';


@Component({
  standalone: true,
  imports: [
    CommonModule, ScreenShellComponent, SvgIconComponent,
    KebabComponent, PaySectionComponent,
  ],
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss'],
})
export class PaymentMethodsComponent {
  iconCard    = ICON_CARD;
  iconBitcoin = ICON_BITCOIN;
  iconPaypal  = ICON_PAYPAL;
  iconStar    = ICON_STAR;
  iconShield  = ICON_SHIELD_CHECK;

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/perfil']); }
}