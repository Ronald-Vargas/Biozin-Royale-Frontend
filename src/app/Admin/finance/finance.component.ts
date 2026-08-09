import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH, ICON_ARROW_DOWN, ICON_ARROW_UP, ICON_DICE } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { FinIconComponent } from './Components/fin-icon/fin-icon.component';
import { WalletTransactionService } from 'src/app/Core/Services/wallet-transaction.service';
import { FinanzasSummaryResultado, FinanzasTransaccionResultado } from 'src/app/Core/Models/wallet-transaction.models';

type FilterKey = 'todas' | 'deposito' | 'retiro';

interface SummaryCard {
  label:  string;
  icon:   string;
  color:  string;
  bg:     string;
  bd:     string;
  count:  string;
  amount: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, FinIconComponent,
  ],
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
})
export class AdminFinanceComponent implements OnInit {
  iconSearch = ICON_SEARCH;
  iconDown   = ICON_ARROW_DOWN;
  iconUp     = ICON_ARROW_UP;
  iconDice   = ICON_DICE;

  q: string = '';
  filter: FilterKey = 'todas';
  page = 0;
  readonly PAGE_SIZE = 10;

  loadingSummary = true;
  loadingRecent  = true;
  summaryError   = '';
  recentError    = '';

  summary: SummaryCard[] = [];
  allRecent: FinanzasTransaccionResultado[] = [];

  filters: { key: FilterKey; label: string }[] = [
    { key: 'todas',   label: 'Todas' },
    { key: 'deposito', label: 'Depósitos' },
    { key: 'retiro',   label: 'Retiros' },
  ];

  constructor(
    private router: Router,
    private walletTransactionService: WalletTransactionService,
  ) {}

  ngOnInit(): void {
    this.walletTransactionService.adminGetSummary().subscribe({
      next: (res) => {
        this.loadingSummary = false;
        if (!res.blnError && res.returnValue) {
          this.buildSummary(res.returnValue);
        } else {
          this.summaryError = res.strResponseMessage || 'No se pudo cargar el resumen.';
        }
      },
      error: () => {
        this.loadingSummary = false;
        this.summaryError = 'Error al cargar el resumen.';
      },
    });

    this.walletTransactionService.adminGetRecent(100).subscribe({
      next: (res) => {
        this.loadingRecent = false;
        if (!res.blnError && res.returnValue) {
          this.allRecent = res.returnValue;
        } else {
          this.recentError = res.strResponseMessage || 'No se pudo cargar las transacciones.';
        }
      },
      error: () => {
        this.loadingRecent = false;
        this.recentError = 'Error al cargar las transacciones.';
      },
    });
  }

  get filteredRecent(): FinanzasTransaccionResultado[] {
    let list = this.allRecent;

    if (this.filter !== 'todas') {
      const type = this.filter === 'deposito' ? 'deposit' : 'withdrawal';
      list = list.filter(t => t.transactionType === type);
    }

    const q = this.q.trim().toLowerCase();
    if (q) {
      list = list.filter(t =>
        t.username.toLowerCase().includes(q) ||
        t.displayName.toLowerCase().includes(q) ||
        this.typeLabel(t.transactionType).toLowerCase().includes(q)
      );
    }

    return list;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRecent.length / this.PAGE_SIZE);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  get pagedRecent(): FinanzasTransaccionResultado[] {
    const start = this.page * this.PAGE_SIZE;
    return this.filteredRecent.slice(start, start + this.PAGE_SIZE);
  }

  setFilter(key: FilterKey): void { this.filter = key; this.page = 0; }

  onSearch(value: string): void { this.q = value; this.page = 0; }

  goPage(p: number): void { this.page = Math.max(0, Math.min(p, this.totalPages - 1)); }

  typeLabel(type: string): string {
    return type === 'deposit' ? 'Depósito' : 'Retiro';
  }

  typeColor(type: string): string {
    return type === 'deposit' ? '#4fd190' : '#e06a6a';
  }

  typeIcon(type: string): string {
    return type === 'deposit' ? this.iconDown : this.iconUp;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      completed: 'Completado',
      pending:   'En proceso',
      failed:    'Fallido',
    };
    return map[status] ?? status;
  }

  statusColor(status: string): string {
    if (status === 'pending') return '#e7c86b';
    if (status === 'failed')  return '#e06a6a';
    return '#4fd190';
  }

  fmtAmount(t: FinanzasTransaccionResultado): string {
    const sign = t.transactionType === 'deposit' ? '+' : '-';
    return `${sign}$${Math.abs(t.amount).toFixed(2)}`;
  }

  fmtDate(iso: string): string {
    const d = new Date(iso);
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${d.getDate().toString().padStart(2,'0')} ${months[d.getMonth()]} · ${hh}:${mm}`;
  }

  goBack(): void { this.router.navigate(['/admin']); }

  private buildSummary(s: FinanzasSummaryResultado): void {
    this.summary = [
      {
        label:  'Depósitos',
        icon:   ICON_ARROW_DOWN,
        color:  '#62d89b',
        bg:     'rgba(63,174,110,0.16)',
        bd:     'rgba(63,174,110,0.5)',
        count:  `${s.depositCount} transacción${s.depositCount !== 1 ? 'es' : ''}`,
        amount: `$${s.depositTotal.toFixed(2)}`,
      },
      {
        label:  'Retiros',
        icon:   ICON_ARROW_UP,
        color:  '#ec8a8a',
        bg:     'rgba(224,106,106,0.14)',
        bd:     'rgba(224,106,106,0.5)',
        count:  `${s.withdrawalCount} transacción${s.withdrawalCount !== 1 ? 'es' : ''}`,
        amount: `$${s.withdrawalTotal.toFixed(2)}`,
      },
      {
        label:  'Apuestas',
        icon:   ICON_DICE,
        color:  'var(--gold-1)',
        bg:     'rgba(212,167,60,0.14)',
        bd:     'rgba(212,167,60,0.5)',
        count:  `${s.betCount} apuesta${s.betCount !== 1 ? 's' : ''}`,
        amount: `$${s.betTotal.toFixed(2)}`,
      },
    ];
  }
}
