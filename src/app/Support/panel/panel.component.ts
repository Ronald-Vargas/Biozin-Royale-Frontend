import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHECK_DONE_CIRCLE, ICON_OPTIONS, ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { SupportKpi, supportKpis, SupportTicket, SUPPORT_TICKETS } from '../shared/support.data';
import { TicketRowComponent } from '../shared/ticket-row/ticket-row.component';
import { SupportBrandComponent } from './Components/support-brand/support-brand.component';
import { SupportKpiComponent } from './Components/support-kpi/support-kpi.component';


interface TkTab { key: string; match: string; }

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    SupportNavComponent, TicketRowComponent, SupportBrandComponent, SupportKpiComponent,
  ],
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class SupportPanelComponent{
  iconSearch  = ICON_SEARCH;
  iconOptions = ICON_OPTIONS;
  iconEmpty   = ICON_CHECK_DONE_CIRCLE;

  tab = 'Nuevos';
  q = '';

  kpis: SupportKpi[] = supportKpis();

  tabs: TkTab[] = [
    { key: 'Nuevos',     match: 'Nuevo' },
    { key: 'En proceso', match: 'En proceso' },
    { key: 'Asignados',  match: 'Asignado' },
    { key: 'Resueltos',  match: 'Resuelto' },
  ];

  constructor(private router: Router) {}

  get matchStatus(): string {
    return this.tabs.find(t => t.key === this.tab)?.match || 'Nuevo';
  }

  get list(): SupportTicket[] {
    const query = this.q.trim().toLowerCase();
    return SUPPORT_TICKETS.filter(t =>
      t.status === this.matchStatus &&
      (query === '' ||
        t.name.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query))
    );
  }

  count(match: string): number {
    return SUPPORT_TICKETS.filter(t => t.status === match).length;
  }

  isActive(key: string): boolean { return this.tab === key; }

  openTicket(id: string) {
    this.router.navigate(['/soporte/ticket', id]);
  }
}