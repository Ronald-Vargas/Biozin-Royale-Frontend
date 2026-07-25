import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEND, ICON_TIME, ICON_HEADSET, ICON_PERSON } from 'src/app/User/shared/icons/icons';
import { TK_STATUS, CAT_ICON, statusLabel } from 'src/app/Support/shared/support.data';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado, TicketMessage } from 'src/app/Core/Models/ticket.models';
import { AuthService } from 'src/app/Core/Services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-user-ticket',
  templateUrl: './user-ticket.component.html',
  styleUrls: ['./user-ticket.component.scss'],
})
export class UserTicketComponent implements OnInit, OnDestroy {
  iconSend    = ICON_SEND;
  iconTime    = ICON_TIME;
  iconHeadset = ICON_HEADSET;
  iconPerson  = ICON_PERSON;

  @ViewChild('threadEl') threadEl!: ElementRef<HTMLDivElement>;

  ticket: TicketResultado | null = null;
  messages: TicketMessage[] = [];
  reply = '';

  loading = true;
  sending = false;
  errorMsg = '';

  private ticketId = '';
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastMessageCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.ticketId) { this.router.navigate(['/mis-tickets']); return; }

    this.loadAll();
    this.pollInterval = setInterval(() => this.pollMessages(), 4000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  // ── Data ──────────────────────────────────────────────────

  private loadAll(): void {
    this.ticketService.obtener(this.ticketId).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.ticket = res.returnValue;
        } else {
          this.errorMsg = res.strResponseMessage || 'No se pudo cargar el ticket.';
        }
      },
      error: () => { this.errorMsg = 'No se pudo conectar con el servidor.'; },
    });

    this.ticketService.listarMensajes(this.ticketId).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.messages = res.returnValue;
          this.lastMessageCount = this.messages.length;
          this.scrollDown();
        }
      },
      error: () => { this.loading = false; },
    });
  }

  private pollMessages(): void {
    this.ticketService.listarMensajes(this.ticketId).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue && res.returnValue.length !== this.lastMessageCount) {
          this.messages = res.returnValue;
          this.lastMessageCount = this.messages.length;
          this.scrollDown();
        }
      },
    });
  }

  // ── Enviar ────────────────────────────────────────────────

  send(): void {
    if (!this.reply.trim() || this.sending) return;
    this.sending = true;
    const body = this.reply.trim();
    this.reply = '';

    this.ticketService.enviarMensaje(this.ticketId, body).subscribe({
      next: (res) => {
        this.sending = false;
        if (!res.blnError && res.returnValue) {
          this.messages = [...this.messages, res.returnValue];
          this.lastMessageCount = this.messages.length;
          this.scrollDown();
        }
      },
      error: () => { this.sending = false; this.reply = body; },
    });
  }

  onEnter(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  // ── Helpers ───────────────────────────────────────────────

  isUserMsg(m: TicketMessage): boolean {
    return m.senderRole === 'user' || m.senderRole === 'authenticated';
  }

  ticketLabel(): string {
    return this.ticket ? `#BR-${this.ticket.ticketNumber}` : '';
  }

  statusDisplay(): string {
    return this.ticket ? statusLabel(this.ticket.status) : '';
  }

  statusStyle() {
    const s = this.ticket?.status ?? 'nuevo';
    return TK_STATUS[s] || TK_STATUS['nuevo'];
  }

  catIcon(): string {
    return CAT_ICON[this.ticket?.category ?? ''] || '';
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  }

  goBack(): void { this.router.navigate(['/mis-tickets']); }

  private scrollDown(): void {
    setTimeout(() => {
      if (this.threadEl?.nativeElement) {
        this.threadEl.nativeElement.scrollTop = this.threadEl.nativeElement.scrollHeight;
      }
    }, 60);
  }
}
