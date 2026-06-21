import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupportTicket } from 'src/app/Support/shared/support.data';
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

  ticket: Partial<SupportTicket> = {
    id:      '#BR-45824',
    cat:     'Pagos',
    subject: 'Consulta',
  };

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || history.state;
    if (state?.ticket) this.ticket = state.ticket;
  }

  goBack()   { this.router.navigate(['/soporte-usuario']); }
  goSoporte(){ this.router.navigate(['/soporte-usuario']); }
}