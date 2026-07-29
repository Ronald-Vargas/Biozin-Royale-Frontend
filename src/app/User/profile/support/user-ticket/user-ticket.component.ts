import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEND, ICON_TIME, ICON_HEADSET, ICON_PERSON, ICON_ATTACH, ICON_DOWNLOAD } from 'src/app/User/shared/icons/icons';
import { TK_STATUS, CAT_ICON, statusLabel } from 'src/app/Support/shared/support.data';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado, TicketMessage } from 'src/app/Core/Models/ticket.models';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { SupabaseStorageService } from 'src/app/Core/Services/supabase-storage.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-user-ticket',
  templateUrl: './user-ticket.component.html',
  styleUrls: ['./user-ticket.component.scss'],
})
export class UserTicketComponent implements OnInit, OnDestroy {
  iconSend     = ICON_SEND;
  iconTime     = ICON_TIME;
  iconHeadset  = ICON_HEADSET;
  iconPerson   = ICON_PERSON;
  iconAttach   = ICON_ATTACH;
  iconDownload = ICON_DOWNLOAD;

  @ViewChild('threadEl') threadEl!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  ticket: TicketResultado | null = null;
  messages: TicketMessage[] = [];
  reply = '';

  loading = true;
  sending = false;
  reopening = false;
  closing = false;
  errorMsg = '';
  selectedFile: File | null = null;
  uploadError = '';
  hoverRating = 0;

  private ticketId = '';
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastMessageCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private storage: SupabaseStorageService,
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

  // ── Archivos ──────────────────────────────────────────────

  pickFile(): void { this.fileInput?.nativeElement.click(); }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.uploadError = '';
    if (!file) return;
    const err = this.storage.validate(file);
    if (err) { this.uploadError = err; return; }
    this.selectedFile = file;
    (event.target as HTMLInputElement).value = '';
  }

  clearFile(): void { this.selectedFile = null; this.uploadError = ''; }

  // ── Enviar ────────────────────────────────────────────────

  async send(): Promise<void> {
    if ((!this.reply.trim() && !this.selectedFile) || this.sending) return;
    this.sending = true;
    const body = this.reply.trim();
    this.reply = '';

    let fileUrl: string | undefined;
    let fileName: string | undefined;

    if (this.selectedFile) {
      try {
        const r = await this.storage.upload(this.ticketId, this.selectedFile);
        fileUrl = r.url;
        fileName = r.name;
        this.selectedFile = null;
      } catch {
        this.reply = body;
        this.sending = false;
        this.uploadError = 'No se pudo subir el archivo. Intenta de nuevo.';
        return;
      }
    }

    this.ticketService.enviarMensaje(this.ticketId, body, fileUrl, fileName).subscribe({
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

  get isResolved(): boolean  { return this.ticket?.status === 'resuelto'; }
  get isClosed(): boolean    { return this.ticket?.status === 'cerrado'; }
  get isRated(): boolean     { return !!this.ticket?.rating; }
  get currentRating(): number { return this.ticket?.rating ?? 0; }
  get needsChoice(): boolean { return this.isResolved && this.isRated && this.currentRating === 3; }

  readonly stars = [1, 2, 3, 4, 5];
  readonly starLabels = ['Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'];

  reopen(): void {
    if (this.reopening) return;
    this.reopening = true;
    this.ticketService.reopen(this.ticketId).subscribe({
      next: (res) => {
        this.reopening = false;
        if (!res.blnError && res.returnValue) {
          this.ticket = res.returnValue;
          this.hoverRating = 0;
        }
      },
      error: () => { this.reopening = false; },
    });
  }

  cerrar(): void {
    if (this.closing) return;
    this.closing = true;
    this.ticketService.cerrar(this.ticketId).subscribe({
      next: (res) => {
        this.closing = false;
        if (!res.blnError && res.returnValue) {
          this.ticket = res.returnValue;
        }
      },
      error: () => { this.closing = false; },
    });
  }

  submitRating(rating: number): void {
    if (this.isRated) return;
    this.ticketService.rate(this.ticketId, rating).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.ticket = res.returnValue;
          this.hoverRating = 0;
        }
      },
    });
  }

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
