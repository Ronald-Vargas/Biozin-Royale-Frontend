import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_ADD, ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { SupportTicket } from 'src/app/Core/Models/ticket.models';
import { statusLabel, relativeTime } from 'src/app/Support/shared/support.data';
import { TicketRowComponent } from 'src/app/Support/shared/ticket-row/ticket-row.component';
import { InternalRequestService } from 'src/app/Core/Services/internal-request.service';
import { InternalRequestResultado } from 'src/app/Core/Models/internal-request.models';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminHeaderComponent, TicketRowComponent,
  ],
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss'],
})
export class SolicitudesComponent implements OnInit {
  iconSearch = ICON_SEARCH;
  iconAdd    = ICON_ADD;

  q = '';
  activeFilter = 'Todos';
  loading = true;

  filters = ['Todos', 'Nuevo', 'En proceso', 'Resuelto', 'Cerrado'];

  private allSolicitudes: SupportTicket[] = [];

  constructor(private router: Router, private internalRequestService: InternalRequestService) {}

  ngOnInit(): void {
    this.internalRequestService.listarMias().subscribe({
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
    const query = this.q.trim().toLowerCase();
    return this.allSolicitudes.filter(t =>
      (this.activeFilter === 'Todos' || t.status === this.activeFilter) &&
      (query === '' ||
        t.name.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query))
    );
  }

  goBack()          { this.router.navigate(['/support']); }
  goCrear()         { this.router.navigate(['/soporte/solicitudes/nueva']); }
  openSolicitud(id: string) { this.router.navigate(['/soporte/solicitud', id]); }

  private mapSolicitud(r: InternalRequestResultado): SupportTicket {
    return {
      id:       r.id,
      name:     r.targetAdminName || 'Admin',
      email:    '',
      subject:  r.subject,
      cat:      'Para: ' + (r.targetAdminName || 'Admin'),
      status:   statusLabel(r.status),
      time:     relativeTime(r.createdAt),
      assigned: r.targetAdminName || 'Sin asignar',
      msgs:     [],
    };
  }
}
