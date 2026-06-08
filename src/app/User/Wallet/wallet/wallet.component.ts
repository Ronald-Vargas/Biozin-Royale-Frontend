import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../shared/components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../shared/components/svg-icons/svg-icon.component';
import { GoldButtonComponent }  from '../shared/components/gold-button/gold-button.component';
import { GhostButtonComponent } from '../shared/components/GhostButton/ghost-button.component';
import {
  ICON_EYE, ICON_EYE_OFF, ICON_ARROW_DOWN, ICON_ARROW_UP, ICON_GIFT_FILLED,
} from '../shared/icons/icons';

interface Tx {
  type:  string;
  date:  string;
  amt:   string;
  pos:   boolean;
  icon:  string;
  color: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, ScreenShellComponent, SvgIconComponent,
    GoldButtonComponent, GhostButtonComponent,
  ],
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletPage {
  hidden = false;

  iconEye    = ICON_EYE;
  iconEyeOff = ICON_EYE_OFF;

  transactions: Tx[] = [
    { type: 'Depósito', date: '20 May 2024 · 14:35', amt: '+ $500.00', pos: true,  icon: ICON_ARROW_DOWN,  color: '#4fd190' },
    { type: 'Retiro',   date: '18 May 2024 · 11:20', amt: '- $200.00', pos: false, icon: ICON_ARROW_UP,    color: '#e06a6a' },
    { type: 'Bono',     date: '17 May 2024 · 09:15', amt: '+ $100.00', pos: true,  icon: ICON_GIFT_FILLED, color: 'var(--gold-1)' },
  ];

  constructor(private router: Router) {}

  toggleHidden() { this.hidden = !this.hidden; }
  goBack()       { this.router.navigate(['/home'], { replaceUrl: true }); }
  goDeposito()   { this.router.navigate(['/deposito']); }
  goRetirar()    { this.router.navigate(['/retirar']); }
  goTransacciones() { this.router.navigate(['/transacciones']); }
}