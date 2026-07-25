import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHECK_DONE_CIRCLE, ICON_OPTIONS, ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { SupportKpi, SupportTicket, statusLabel, relativeTime } from '../shared/support.data';
import { TicketRowComponent } from '../shared/ticket-row/ticket-row.component';
import { SupportBrandComponent } from './Components/support-brand/support-brand.component';
import { SupportKpiComponent } from './Components/support-kpi/support-kpi.component';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado } from 'src/app/Core/Models/ticket.models';
import { ICON_CHATBUBBLE, ICON_TIME, ICON_CHECK_DONE } from 'src/app/User/shared/icons/icons';

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
export class SupportPanelComponent implements OnInit {
  iconSearch  = ICON_SEARCH;
  iconOptions = ICON_OPTIONS;
  iconEmpty   = ICON_CHECK_DONE_CIRCLE;

  tab = 'Nuevos';
  q = '';
  loading = true;

  kpis: SupportKpi[] = [];

  tickets: SupportTicket[] = [];

  tabs: TkTab[] = [
    { key: 'Nuevos',     match: 'nuevo' },
    { key: 'En proceso', match: 'en_proceso' },
    { key: 'Resueltos',  match: 'resuelto' },
  ];

  constructor(private router: Router, private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.listarTodos().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.tickets = res.returnValue.map((t, i) => this.mapTicket(t, i));
          this.buildKpis(res.returnValue);
        }
      },
      error: () => { this.loading = false; },
    });
  }

  get matchStatus(): string {
    return this.tabs.find(t => t.key === this.tab)?.match || 'nuevo';
  }

  get list(): SupportTicket[] {
    const query = this.q.trim().toLowerCase();
    return this.tickets.filter(t =>
      t.status === statusLabel(this.matchStatus) &&
      (query === '' ||
        t.name.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query))
    );
  }

  count(match: string): number {
    return this.tickets.filter(t => t.status === statusLabel(match)).length;
  }

  isActive(key: string): boolean { return this.tab === key; }

  openTicket(id: string) { this.router.navigate(['/soporte/ticket', id]); }

  private mapTicket(t: TicketResultado, idx: number): SupportTicket {
    return {
      id:       t.id,
      name:     t.userDisplayName || t.userUsername || `Usuario ${idx + 1}`,
      email:    t.userEmail || '',
      subject:  t.subject,
      cat:      t.category,
      status:   statusLabel(t.status),
      time:     relativeTime(t.createdAt),
      assigned: t.assignedToName || 'Sin asignar',
      msgs:     [],
    };
  }

  private buildKpis(tickets: TicketResultado[]): void {
    const n = tickets.filter(t => t.status === 'nuevo').length;
    const p = tickets.filter(t => t.status === 'en_proceso').length;
    const r = tickets.filter(t => t.status === 'resuelto').length;
    this.kpis = [
      { label: 'Nuevos',        value: n, delta: '', icon: ICON_CHATBUBBLE, tint: '#e06a6a', bg: 'rgba(224,106,106,0.16)' },
      { label: 'En proceso',    value: p, delta: '', icon: ICON_TIME,       tint: '#6aa6e0', bg: 'rgba(90,150,220,0.16)' },
      { label: 'Resueltos hoy', value: r, delta: '', icon: ICON_CHECK_DONE, tint: '#62d89b', bg: 'rgba(63,174,110,0.16)' },
    ];
  }
}
