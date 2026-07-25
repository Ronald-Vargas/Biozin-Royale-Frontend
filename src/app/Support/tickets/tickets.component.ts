import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { SupportTicket, statusLabel, relativeTime } from '../shared/support.data';
import { TicketRowComponent } from '../shared/ticket-row/ticket-row.component';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado } from 'src/app/Core/Models/ticket.models';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    SupportNavComponent, AdminHeaderComponent, TicketRowComponent,
  ],
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
})
export class TicketsComponent implements OnInit {
  iconSearch = ICON_SEARCH;

  q = '';
  activeFilter = 'Todos';
  loading = true;

  filters = ['Todos', 'Nuevo', 'En proceso', 'Resuelto'];

  private allTickets: SupportTicket[] = [];

  constructor(private router: Router, private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.listarTodos().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.allTickets = res.returnValue.map((t, i) => this.mapTicket(t, i));
        }
      },
      error: () => { this.loading = false; },
    });
  }

  get list(): SupportTicket[] {
    const query = this.q.trim().toLowerCase();
    return this.allTickets.filter(t =>
      (this.activeFilter === 'Todos' || t.status === this.activeFilter) &&
      (query === '' ||
        t.name.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query))
    );
  }

  goBack()               { this.router.navigate(['/support']); }
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
}
