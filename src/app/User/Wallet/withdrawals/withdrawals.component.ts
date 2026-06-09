import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoldButtonComponent } from '../../shared/Components/gold-button/gold-button.component';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_CHEVRON_DOWN, ICON_EDIT, ICON_BUSINESS, ICON_BITCOIN, ICON_PAYPAL } from '../../shared/icons/icons';


interface InfoRow { k: string; v: string; }

interface WithdrawInfo {
  title: string;
  icon:  string;
  rows:  InfoRow[];
}

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, ScreenShellComponent,
    SvgIconComponent, GoldButtonComponent,
  ],
  selector: 'app-withdrawals',
  templateUrl: './withdrawals.component.html',
  styleUrls: ['./withdrawals.component.scss'],
})
export class WithdrawalsComponent {
  amount = 500;
  other  = '';
  open   = false;
  method = 'Transferencia Bancaria';

  iconChevronDown = ICON_CHEVRON_DOWN;
  iconEdit        = ICON_EDIT;

  methods = ['Transferencia Bancaria', 'Criptomonedas', 'PayPal'];
  amounts = [50, 100, 250, 500];

  withdrawInfo: Record<string, WithdrawInfo> = {
    'Transferencia Bancaria': {
      title: 'Información bancaria',
      icon:  ICON_BUSINESS,
      rows: [
        { k: 'Banco',   v: 'Banco de la Nación' },
        { k: 'Titular', v: 'Juan Pérez' },
        { k: 'Cuenta',  v: '•••• •••• •••• 4567' },
      ],
    },
    'Criptomonedas': {
      title: 'Datos de la billetera',
      icon:  ICON_BITCOIN,
      rows: [
        { k: 'Moneda',    v: 'Bitcoin (BTC)' },
        { k: 'Red',       v: 'Bitcoin Network' },
        { k: 'Dirección', v: 'bc1q···w4gf8' },
      ],
    },
    'PayPal': {
      title: 'Datos de PayPal',
      icon:  ICON_PAYPAL,
      rows: [
        { k: 'Correo',  v: 'juanperez@gmail.com' },
        { k: 'Titular', v: 'Juan Pérez' },
      ],
    },
  };

  constructor(private router: Router) {}

  get shown(): string {
    if (this.other !== '') return (parseFloat(this.other) || 0).toFixed(2);
    return this.amount.toFixed(2);
  }

  get info(): WithdrawInfo { return this.withdrawInfo[this.method]; }

  toggleDropdown() { this.open = !this.open; }

  selectMethod(m: string) {
    this.method = m;
    this.open = false;
  }

  selectAmount(a: number) {
    this.amount = a;
    this.other = '';
  }

  onOtherInput(value: string) {
    this.other = value.replace(/[^0-9.]/g, '');
  }

  isAmountActive(a: number): boolean {
    return this.amount === a && this.other === '';
  }

  goBack()      { this.router.navigate(['/wallet']); }
  confirm()     { this.router.navigate(['/wallet']); }
  changeInfo()  { /* placeholder */ }
}