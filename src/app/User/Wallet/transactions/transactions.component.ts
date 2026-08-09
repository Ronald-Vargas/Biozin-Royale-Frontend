import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_ARROW_DOWN, ICON_ARROW_UP } from '../../shared/icons/icons';
import { WalletTransactionService } from 'src/app/Core/Services/wallet-transaction.service';
import {
  WalletTransactionResultado,
  isDeposit,
  transactionTypeLabel,
  transactionColor,
  transactionStatusLabel,
  transactionStatusColor,
  formatTransactionDate,
  formatTransactionAmount,
} from 'src/app/Core/Models/wallet-transaction.models';

interface Tx {
  id:            string;
  type:          string;
  cat:           'deposito' | 'retiro';
  date:          string;
  amt:           string;
  pos:           boolean;
  icon:          string;
  color:         string;
  method:        string;
  status:        string;
  statusColor:   string;
  receiptNumber: string | null;
}

interface Filter { key: string; label: string; }

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit {
  filter = 'todas';

  filters: Filter[] = [
    { key: 'todas',    label: 'Todas' },
    { key: 'deposito', label: 'Depósitos' },
    { key: 'retiro',   label: 'Retiros' },
  ];

  allTx: Tx[] = [];

  constructor(private router: Router, private walletTransactionService: WalletTransactionService) {}

  ngOnInit(): void {
    this.walletTransactionService.getTransactions().subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.allTx = res.returnValue.map(t => this.toTx(t));
        }
      },
    });
  }

  private toTx(t: WalletTransactionResultado): Tx {
    const deposit = isDeposit(t);
    return {
      id:            t.id,
      type:          transactionTypeLabel(t),
      cat:           deposit ? 'deposito' : 'retiro',
      date:          formatTransactionDate(t.createdAt),
      amt:           formatTransactionAmount(t),
      pos:           deposit,
      icon:          deposit ? ICON_ARROW_DOWN : ICON_ARROW_UP,
      color:         transactionColor(t),
      method:        '',
      status:        transactionStatusLabel(t),
      statusColor:   transactionStatusColor(t),
      receiptNumber: t.receiptNumber ?? null,
    };
  }

  get list(): Tx[] {
    return this.filter === 'todas'
      ? this.allTx
      : this.allTx.filter(t => t.cat === this.filter);
  }

  goBack() { this.router.navigate(['/wallet']); }

  statusColor(status: string): string {
    const tx = this.allTx.find(t => t.status === status);
    return tx?.statusColor ?? '#4fd190';
  }
}