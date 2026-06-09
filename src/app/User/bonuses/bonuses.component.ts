import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../shared/Components/screen-shell/screen-shell.component';
import { BonusCardComponent, ActiveBonus } from './Components/bonus-card/bonus-card.component';
import { BonusHistCardComponent, HistBonus } from './Components/bonus-hist-card/bonus-hist-card.component';


interface Filter { key: string; label: string; }

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, BonusCardComponent, BonusHistCardComponent],
  selector: 'app-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.scss'],
})
export class BonusesComponent {
  tab    = 'activos';
  filter = 'todos';

  tabs = [
    { k: 'activos',   l: 'Activos' },
    { k: 'historial', l: 'Historial' },
  ];

  filters: Filter[] = [
    { key: 'todos',    label: 'Todos' },
    { key: 'activo',   label: 'Activos' },
    { key: 'usado',    label: 'Usados' },
    { key: 'expirado', label: 'Expirados' },
  ];

  activeBonuses: ActiveBonus[] = [
    { id: 'bienvenida', title: 'Bono de Bienvenida', desc: '100% hasta $500', req: 'Requisito de apuesta: 30x', time: '6d 23h', icon: 'trophy' },
    {id: 'cashback',   title: 'Cashback Semanal',   desc: '10% Cashback',    req: 'Sin requisitos',            time: '3d 12h', icon: 'shield' },
  ];

  histBonuses: HistBonus[] = [
    { title: 'Bono de Bienvenida', desc: '1,000,000 Fichas',                  status: 'usado',    date: '01/05/2024 · 14:30', icon: 'trophy' },
    { title: 'Giro Gratis',        desc: '1 Tiro Gratis en Gates of Olympus', status: 'activo',   date: '27/04/2024 · 09:45', icon: 'sync-circle' },
    { title: 'Bono de Recarga',    desc: '50% hasta $200',                    status: 'activo',   date: '27/04/2024 · 08:10', icon: 'wallet' },
    { title: 'Bono Diario',        desc: '1 Royale Ficha Gratis',             status: 'expirado', date: '26/04/2024 · 23:59', icon: 'calendar' },
  ];

  constructor(private router: Router) {}

  get histList(): HistBonus[] {
    return this.histBonuses.filter(b => this.filter === 'todos' || b.status === this.filter);
  }

  goBack() { this.router.navigate(['/home'], { replaceUrl: true }); }
  goDetalle(id?: string) { if (id) this.router.navigate(['/bono', id]);
}
}