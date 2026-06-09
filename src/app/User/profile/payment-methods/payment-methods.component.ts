import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../shared/components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../shared/components/svg-icons/svg-icon.component';
import { KebabComponent }       from './components/kebab/kebab.component';
import { PaySectionComponent }  from './components/pay-section/pay-section.component';
import {
  ICON_CARD, ICON_BITCOIN, ICON_PAYPAL,
  ICON_STAR, ICON_SHIELD_CHECK,
} from '../shared/icons/icons';

@Component({
  standalone: true,
  imports: [
    CommonModule, ScreenShellComponent, SvgIconComponent,
    KebabComponent, PaySectionComponent,
  ],
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss'],
})
export class PaymentMethods {
  iconCard    = ICON_CARD;
  iconBitcoin = ICON_BITCOIN;
  iconPaypal  = ICON_PAYPAL;
  iconStar    = ICON_STAR;
  iconShield  = ICON_SHIELD_CHECK;

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/perfil']); }
}