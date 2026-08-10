import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { InternalRequestService } from 'src/app/Core/Services/internal-request.service';
import { InternalRequestResultado } from 'src/app/Core/Models/internal-request.models';
import { SupportTicket } from 'src/app/Core/Models/ticket.models';
import { statusLabel, relativeTime } from 'src/app/Support/shared/support.data';
import { TicketRowComponent } from 'src/app/Support/shared/ticket-row/ticket-row.component';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, TicketRowComponent,
  ],
  selector: 'app-admin-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss'],
})
export class AdminSolicitudesComponent implements OnInit {
  iconSearch = ICON_SEARCH;

  q = '';
  activeFilter = 'Todos';
  loading = true;
  filters = ['Todos', 'Nuevo', 'En proceso', 'Resuelto', 'Cerrado'];

  private allSolicitudes: SupportTicket[] = [];

  constructor(private router: Router, private internalRequestService: InternalRequestService) {}

  ngOnInit(): void {
    this.internalRequestService.listarParaMi().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.allSolicitudes = res.returnValue.map(r => this.mapSolicitud(r));
        }
      },
      error: () => { this.loading = false; },
    });
  }

  get list(): SupportTicket[] {
    const q = this.q.trim().toLowerCase();
    return this.allSolicitudes.filter(t =>
      (this.activeFilter === 'Todos' || t.status === this.activeFilter) &&
      (q === '' || t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q))
    );
  }

  openSolicitud(id: string): void { this.router.navigate(['/soporte/solicitud', id]); }
  goBack(): void { this.router.navigate(['/admin']); }

  private mapSolicitud(r: InternalRequestResultado): SupportTicket {
    return {
      id:       r.id,
      name:     r.requestedByName || 'Soporte',
      email:    '',
      subject:  r.subject,
      cat:      'De: ' + (r.requestedByName || 'Soporte'),
      status:   statusLabel(r.status),
      time:     relativeTime(r.createdAt),
      assigned: r.targetAdminName || 'Sin asignar',
      msgs:     [],
    };
  }
}
