import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CAT_ICON } from 'src/app/Support/shared/support.data';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHATBUBBLE, ICON_SEND } from 'src/app/User/shared/icons/icons';
import { TicketService } from 'src/app/Core/Services/ticket.service';

const TK_CATEGORIES = ['Pagos', 'Retiros', 'Cuenta', 'Bonos', 'Juegos', 'Otro'];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.scss'],
})
export class CreateTicketComponent {
  iconChat = ICON_CHATBUBBLE;
  iconSend = ICON_SEND;

  cat         = 'Pagos';
  subject     = '';
  msg         = '';
  loading     = false;
  errorMsg    = '';

  categories = TK_CATEGORIES;

  constructor(private router: Router, private ticketService: TicketService) {}

  get valid(): boolean {
    return this.subject.trim().length >= 4 && this.msg.trim().length >= 8;
  }

  catIcon(c: string): string { return CAT_ICON[c] || ''; }

  goBack() { this.router.navigate(['/soporte']); }

  submit() {
    if (!this.valid || this.loading) return;

    this.loading = true;
    this.errorMsg = '';

    this.ticketService.crear({
      subject:     this.subject.trim(),
      category:    this.cat,
      description: this.msg.trim(),
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) {
          this.errorMsg = res.strResponseMessage || 'No se pudo crear el ticket.';
          return;
        }
        this.router.navigate(['/ticket-ok'], { state: { ticket: res.returnValue } });
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudo conectar con el servidor.';
      },
    });
  }
}
