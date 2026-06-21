import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CAT_ICON, SUPPORT_TICKETS, SupportTicket } from 'src/app/Support/shared/support.data';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHATBUBBLE, ICON_ATTACH, ICON_SEND } from 'src/app/User/shared/icons/icons';

const PLAYER = { name: 'Juan Pérez', email: 'juanperez@gmail.com' };
const TK_CATEGORIES = ['Pagos', 'Retiros', 'Cuenta', 'Bonos', 'Juegos', 'Otro'];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.scss'],
})

export class CreateTicketComponent {
  iconChat   = ICON_CHATBUBBLE;
  iconAttach = ICON_ATTACH;
  iconSend   = ICON_SEND;

  cat     = 'Pagos';
  subject = '';
  msg     = '';
  file: string | null = null;

  categories = TK_CATEGORIES;

  constructor(private router: Router) {}

  get valid(): boolean {
    return this.subject.trim().length >= 4 && this.msg.trim().length >= 8;
  }

  catIcon(c: string): string { return CAT_ICON[c] || ''; }

  toggleFile() {
    this.file = this.file ? null : 'captura_pantalla.png';
  }

  goBack() { this.router.navigate(['/soporte']); }

  submit() {
    if (!this.valid) return;
    const seq = 45824 + SUPPORT_TICKETS.filter(t => /^#BR-/.test(t.id)).length;
    const ticket: SupportTicket = {
      id:       '#BR-' + seq,
      name:     PLAYER.name,
      email:    PLAYER.email,
      subject:  this.subject.trim(),
      cat:      this.cat,
      prio:     'Media',
      status:   'Nuevo',
      time:     'Ahora',
      assigned: 'Sin asignar',
      msgs: [
        {
          who:  'user',
          text: this.msg.trim(),
          t:    new Date().toTimeString().slice(0, 5),
          ...(this.file ? { file: { name: this.file, size: '1.0 MB' } } : {}),
        },
      ],
    };
    SUPPORT_TICKETS.unshift(ticket);
    this.router.navigate(['/ticket-ok'], { state: { ticket } });
  }
}