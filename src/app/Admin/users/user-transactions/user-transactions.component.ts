import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { ICON_ARROW_DOWN, ICON_ARROW_UP, ICON_RECEIPT } from 'src/app/User/shared/icons/icons';
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
  id:          string;
  type:        string;
  cat:         'deposito' | 'retiro';
  date:        string;
  amt:         string;
  pos:         boolean;
  icon:        string;
  color:       string;
  status:      string;
  statusColor: string;
}

type FilterKey = 'todas' | 'deposito' | 'retiro';

@Component({
  standalone: true,
  imports: [CommonModule, AtmosphereComponent, SvgIconComponent, AdminHeaderComponent, AdminNavComponent],
  selector: 'app-user-transactions',
  templateUrl: './user-transactions.component.html',
  styleUrls: ['./user-transactions.component.scss'],
})
export class UserTransactionsComponent implements OnInit {
  iconReceipt  = ICON_RECEIPT;
  iconArrowDown = ICON_ARROW_DOWN;
  iconArrowUp   = ICON_ARROW_UP;

  allTx: Tx[] = [];
  filter: FilterKey = 'todas';
  loading = true;
  error = '';

  filters: { key: FilterKey; label: string }[] = [
    { key: 'todas',    label: 'Todas' },
    { key: 'deposito', label: 'Depósitos' },
    { key: 'retiro',   label: 'Retiros' },
  ];

  private userId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private walletTransactionService: WalletTransactionService,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';

    this.walletTransactionService.adminGetTransactions(this.userId).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.allTx = res.returnValue.map(t => this.toTx(t));
        } else {
          this.error = res.strResponseMessage || 'No se pudo cargar el historial.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al conectar con el servidor.';
      },
    });
  }

  get list(): Tx[] {
    return this.filter === 'todas'
      ? this.allTx
      : this.allTx.filter(t => t.cat === this.filter);
  }

  setFilter(key: FilterKey): void { this.filter = key; }

  goBack(): void { this.router.navigate(['/admin/usuario', this.userId]); }

  private toTx(t: WalletTransactionResultado): Tx {
    const deposit = isDeposit(t);
    return {
      id:          t.id,
      type:        transactionTypeLabel(t),
      cat:         deposit ? 'deposito' : 'retiro',
      date:        formatTransactionDate(t.createdAt),
      amt:         formatTransactionAmount(t),
      pos:         deposit,
      icon:        deposit ? ICON_ARROW_DOWN : ICON_ARROW_UP,
      color:       transactionColor(t),
      status:      transactionStatusLabel(t),
      statusColor: transactionStatusColor(t),
    };
  }
}
