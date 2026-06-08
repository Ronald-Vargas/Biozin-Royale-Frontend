import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../shared/components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../shared/components/svg-icons/svg-icon.component';
import { GoldButtonComponent }  from '../shared/components/gold-button/gold-button.component';
import { MethodBadgeComponent } from './components/method-badge/method-badge.component';
import { AccountBrandComponent } from './components/account-brand/account-brand.component';
import {
  ICON_CARD, ICON_BITCOIN, ICON_PAYPAL, ICON_ADD,
} from '../shared/icons/icons';

interface PayMethod {
  key:   string;
  label: string;
  icon:  string;
  badge: string;
}

interface SavedAccount {
  id:         string;
  brand:      'visa' | 'master' | 'btc' | 'paypal';
  label:      string;
  sub:        string;
  principal?: boolean;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, ScreenShellComponent,
    SvgIconComponent, GoldButtonComponent,
    MethodBadgeComponent, AccountBrandComponent,
  ],
  selector: 'app-deposito',
  templateUrl: './deposito.component.html',
  styleUrls: ['./deposito.component.scss'],
})
export class DepositoPage {
  method = 'crypto';
  account: string | null = 'btc';
  amount: number | null = null;
  other  = '';

  iconCard    = ICON_CARD;
  iconBitcoin = ICON_BITCOIN;
  iconPaypal  = ICON_PAYPAL;
  iconAdd     = ICON_ADD;

  payMethods: PayMethod[] = [
    { key: 'card',   label: 'Tarjeta de crédito/débito', icon: ICON_CARD,    badge: 'cards' },
    { key: 'crypto', label: 'Criptomonedas',             icon: ICON_BITCOIN, badge: 'btc' },
    { key: 'paypal', label: 'PayPal',                    icon: ICON_PAYPAL,  badge: 'paypal' },
  ];

  savedAccounts: Record<string, SavedAccount[]> = {
    card: [
      { id: 'visa',   brand: 'visa',   label: 'VISA',       sub: '•••• 4567', principal: true },
      { id: 'master', brand: 'master', label: 'Mastercard', sub: '•••• 4567' },
    ],
    crypto: [
      { id: 'btc', brand: 'btc', label: 'Bitcoin (BTC)', sub: 'bc1q···4gf8' },
    ],
    paypal: [
      { id: 'pp1', brand: 'paypal', label: 'PayPal', sub: 'juanperez@gmail.com' },
    ],
  };

  amounts = [20, 50, 100, 200];

  constructor(private router: Router) {}

  get accounts(): SavedAccount[] {
    return this.savedAccounts[this.method] || [];
  }

  get sectionLabel(): string {
    if (this.method === 'card')   return 'SELECCIONA TARJETA';
    if (this.method === 'crypto') return 'SELECCIONA BILLETERA';
    return 'SELECCIONA CUENTA';
  }

  selectMethod(key: string) {
    this.method = key;
    const first = this.accounts[0];
    this.account = first ? first.id : null;
  }

  selectAccount(id: string) { this.account = id; }

  selectAmount(a: number) {
    this.amount = a;
    this.other = '';
  }

  onOtherInput(value: string) {
    this.other = value.replace(/[^0-9.]/g, '');
    this.amount = null;
  }

  isMethodActive(key: string): boolean { return this.method === key; }
  isAccountActive(id: string): boolean { return this.account === id; }
  isAmountActive(a: number): boolean { return this.amount === a && this.other === ''; }

  goBack()    { this.router.navigate(['/wallet']); }
  goPagos()   { this.router.navigate(['/pagos']); }
  confirm()   { this.router.navigate(['/wallet']); }
}