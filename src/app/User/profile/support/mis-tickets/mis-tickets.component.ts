import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import {
  ICON_CHATBUBBLES_OUT, ICON_CHEVRON_FWD, ICON_TIME,
} from 'src/app/User/shared/icons/icons';
import { TK_STATUS, CAT_ICON, statusLabel } from 'src/app/Support/shared/support.data';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado } from 'src/app/Core/Models/ticket.models';

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-mis-tickets',
  templateUrl: './mis-tickets.component.html',
  styleUrls: ['./mis-tickets.component.scss'],
})
export class MisTicketsComponent implements OnInit {
  iconEmpty   = ICON_CHATBUBBLES_OUT;
  iconChevron = ICON_CHEVRON_FWD;
  iconTime    = ICON_TIME;

  tickets: TicketResultado[] = [];
  loading = true;
  errorMsg = '';

  constructor(private router: Router, private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.listarMios().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.tickets = res.returnValue;
        } else {
          this.errorMsg = res.strResponseMessage || 'No se pudieron cargar los tickets.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudo conectar con el servidor.';
      },
    });
  }

  ticketLabel(t: TicketResultado): string {
    return `#BR-${t.ticketNumber}`;
  }

  statusDisplay(status: string): string {
    return statusLabel(status);
  }

  statusStyle(status: string) {
    return TK_STATUS[status] || TK_STATUS['nuevo'];
  }

  catIcon(cat: string): string {
    return CAT_ICON[cat] || '';
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  goBack()             { this.router.navigate(['/soporte']); }
  openTicket(id: string) { this.router.navigate(['/mis-tickets', id]); }
}
