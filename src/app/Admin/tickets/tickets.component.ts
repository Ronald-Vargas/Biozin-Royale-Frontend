import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import {
  ICON_SEARCH, ICON_CHATBUBBLES, ICON_CHECK_DONE, ICON_TIME, ICON_HAPPY,
} from 'src/app/User/shared/icons/icons';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado, SupportTicket } from 'src/app/Core/Models/ticket.models';
import { statusLabel, relativeTime } from 'src/app/Support/shared/support.data';
import { TicketRowComponent } from 'src/app/Support/shared/ticket-row/ticket-row.component';
import { ASupKpiComponent, ASupKpi } from '../support/Components/asup-kpi/asup-kpi.component';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent,
    TicketRowComponent, ASupKpiComponent,
  ],
  selector: 'app-admin-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
})
export class AdminTicketsComponent implements OnInit {
  iconSearch = ICON_SEARCH;

  q            = '';
  activeFilter = 'Todos';
  loading      = true;
  filters      = ['Todos', 'Nuevo', 'En proceso', 'Resuelto'];

  private allTickets: SupportTicket[] = [];
  private ratingsMap: Map<string, number | null> = new Map();

  constructor(private router: Router, private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.listarTodos().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.allTickets = res.returnValue.map((t, i) => this.mapTicket(t, i));
          res.returnValue.forEach(t => this.ratingsMap.set(t.id, t.rating ?? null));
        }
      },
      error: () => { this.loading = false; },
    });
  }

  get list(): SupportTicket[] {
    const q = this.q.trim().toLowerCase();
    return this.allTickets.filter(t =>
      (this.activeFilter === 'Todos' || t.status === this.activeFilter) &&
      (q === '' || t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q))
    );
  }

  get total():    number { return this.allTickets.length; }
  get resolved(): number { return this.allTickets.filter(t => t.status === 'Resuelto').length; }
  get pending():  number { return this.allTickets.filter(t => t.status !== 'Resuelto').length; }

  get avgRating(): string {
    const vals = [...this.ratingsMap.values()].filter((r): r is number => r !== null);
    if (!vals.length) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }

  get kpis(): ASupKpi[] {
    const avg = this.avgRating;
    return [
      { label: 'Total',      value: this.total,    icon: ICON_CHATBUBBLES, tint: '#6aa6e0', bg: 'rgba(90,150,220,0.16)'  },
      { label: 'Resueltos',  value: this.resolved, icon: ICON_CHECK_DONE,  tint: '#62d89b', bg: 'rgba(63,174,110,0.16)'  },
      { label: 'Pendientes', value: this.pending,  icon: ICON_TIME,        tint: '#e6b450', bg: 'rgba(212,167,60,0.16)'  },
      { label: 'CSAT',       value: avg,           icon: ICON_HAPPY,       tint: '#d87070', bg: 'rgba(220,100,100,0.14)', sub: avg !== '—' ? avg + ' ★' : 'Sin datos' },
    ];
  }

  openTicket(id: string): void { this.router.navigate(['/soporte/ticket', id]); }
  goBack():               void { this.router.navigate(['/admin/soporte']); }

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
}
