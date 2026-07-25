import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TicketResultado } from 'src/app/Core/Models/ticket.models';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHECK } from 'src/app/User/shared/icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-ticket-ok',
  templateUrl: './ticket-ok.component.html',
  styleUrls: ['./ticket-ok.component.scss'],
})
export class TicketOkComponent implements OnInit {
  iconCheck = ICON_CHECK;

  ticket: Partial<TicketResultado> = {};

  constructor(private router: Router) {}

  ngOnInit() {
    const state = history.state;
    if (state?.ticket) this.ticket = state.ticket;
  }

  get ticketLabel(): string {
    return this.ticket.ticketNumber ? `#BR-${this.ticket.ticketNumber}` : '—';
  }

  goBack()    { this.router.navigate(['/soporte']); }
  goSoporte() { this.router.navigate(['/soporte']); }
}
