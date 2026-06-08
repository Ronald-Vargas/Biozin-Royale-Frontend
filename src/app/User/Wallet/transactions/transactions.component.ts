import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../shared/components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../shared/components/svg-icons/svg-icon.component';
import {
  ICON_ARROW_DOWN, ICON_ARROW_UP, ICON_GIFT_FILLED,
} from '../shared/icons/icons';

interface Tx {
  type:   string;
  cat:    'deposito' | 'retiro';
  date:   string;
  amt:    string;
  pos:    boolean;
  icon:   string;
  color:  string;
  method: string;
  status: string;
}

interface Filter { key: string; label: string; }

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-transacciones',
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.scss'],
})
export class TransaccionesPage {
  filter = 'todas';

  filters: Filter[] = [
    { key: 'todas',    label: 'Todas' },
    { key: 'deposito', label: 'Depósitos' },
    { key: 'retiro',   label: 'Retiros' },
  ];

  allTx: Tx[] = [
    { type: 'Depósito', cat: 'deposito', date: '20 May 2024 · 14:35', amt: '+ $500.00', pos: true,  icon: ICON_ARROW_DOWN,  color: '#4fd190',       method: 'VISA ···4567',           status: 'Completado' },
    { type: 'Retiro',   cat: 'retiro',   date: '18 May 2024 · 11:20', amt: '- $200.00', pos: false, icon: ICON_ARROW_UP,    color: '#e06a6a',       method: 'Transferencia bancaria', status: 'Completado' },
    { type: 'Depósito', cat: 'deposito', date: '15 May 2024 · 20:02', amt: '+ $250.00', pos: true,  icon: ICON_ARROW_DOWN,  color: '#4fd190',       method: 'PayPal',                 status: 'Completado' },
    { type: 'Retiro',   cat: 'retiro',   date: '12 May 2024 · 16:48', amt: '- $120.00', pos: false, icon: ICON_ARROW_UP,    color: '#e06a6a',       method: 'PayPal',                 status: 'En proceso' },
    { type: 'Depósito', cat: 'deposito', date: '09 May 2024 · 10:21', amt: '+ $80.00',  pos: true,  icon: ICON_ARROW_DOWN,  color: '#4fd190',       method: 'Bitcoin (BTC)',          status: 'Completado' },
    { type: 'Retiro',   cat: 'retiro',   date: '03 May 2024 · 22:30', amt: '- $300.00', pos: false, icon: ICON_ARROW_UP,    color: '#e06a6a',       method: 'Transferencia bancaria', status: 'Completado' },
  ];

  constructor(private router: Router) {}

  get list(): Tx[] {
    return this.filter === 'todas'
      ? this.allTx
      : this.allTx.filter(t => t.cat === this.filter);
  }

  goBack() { this.router.navigate(['/wallet']); }

  statusColor(status: string): string {
    if (status === 'En proceso') return '#e7c86b';
    return '#4fd190';
  }
}