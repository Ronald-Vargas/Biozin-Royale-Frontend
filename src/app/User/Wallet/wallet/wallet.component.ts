import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { GhostButtonComponent } from '../../shared/Components/ghost-button/ghost-button.component';
import { GoldButtonComponent } from '../../shared/Components/gold-button/gold-button.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_EYE, ICON_EYE_OFF, ICON_ARROW_DOWN, ICON_ARROW_UP } from '../../shared/icons/icons';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { WalletTransactionService } from 'src/app/Core/Services/wallet-transaction.service';
import {
  WalletTransactionResultado,
  isDeposit,
  transactionTypeLabel,
  transactionColor,
  formatTransactionDate,
  formatTransactionAmount,
} from 'src/app/Core/Models/wallet-transaction.models';

interface Tx {
  id:    string;
  type:  string;
  date:  string;
  amt:   string;
  pos:   boolean;
  icon:  string;
  color: string;
}

const PREVIEW_COUNT = 4;

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
export class WalletComponent implements OnInit, ViewWillEnter {
  hidden = false;

  iconEye    = ICON_EYE;
  iconEyeOff = ICON_EYE_OFF;

  readonly balance = this.balanceService.balance;

  transactions: Tx[] = [];

  constructor(
    private router: Router,
    private balanceService: BalanceService,
    private walletTransactionService: WalletTransactionService,
  ) {}

  ngOnInit(): void {
    this.balanceService.load();
    this.cargarTransacciones();
  }

  ionViewWillEnter(): void {
    this.balanceService.reload();
    this.cargarTransacciones();
  }

  private cargarTransacciones(): void {
    this.walletTransactionService.getTransactions().subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.transactions = res.returnValue.slice(0, PREVIEW_COUNT).map(t => this.toTx(t));
        }
      },
    });
  }

  private toTx(t: WalletTransactionResultado): Tx {
    const deposit = isDeposit(t);
    return {
      id: t.id,
      type: transactionTypeLabel(t),
      date: formatTransactionDate(t.createdAt),
      amt: formatTransactionAmount(t),
      pos: deposit,
      icon: deposit ? ICON_ARROW_DOWN : ICON_ARROW_UP,
      color: transactionColor(t),
    };
  }

  toggleHidden() { this.hidden = !this.hidden; }
  goBack()       { this.router.navigate(['/home'], { replaceUrl: true }); }
  goDeposito()   { this.router.navigate(['/deposito']); }
  goRetirar()    { this.router.navigate(['/retirar']); }
  goTransacciones() { this.router.navigate(['/transacciones']); }
}
