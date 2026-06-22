import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { SupportTicket, SUPPORT_TICKETS } from '../shared/support.data';
import { TicketRowComponent } from '../shared/ticket-row/ticket-row.component';


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
export class TicketsComponent {
  iconSearch = ICON_SEARCH;

  q = '';
  activeFilter = 'Todos';

  filters = ['Todos', 'Nuevo', 'En proceso', 'Resuelto'];

  constructor(private router: Router) {}

  get list(): SupportTicket[] {
    const query = this.q.trim().toLowerCase();
    return SUPPORT_TICKETS.filter(t =>
      (this.activeFilter === 'Todos' || t.status === this.activeFilter) &&
      (query === '' ||
        t.name.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query))
    );
  }

  goBack()          { this.router.navigate(['/soporte']); }
  openTicket(id: string) { this.router.navigate(['/soporte/ticket', id]); }
}