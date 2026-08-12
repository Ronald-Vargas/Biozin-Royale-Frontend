import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_BACK, ICON_PERSON_ADD, ICON_CHECK, ICON_ATTACH, ICON_CHECK_CIRCLE, ICON_DOTS_HORIZ, ICON_SWAP } from 'src/app/User/shared/icons/icons';
import { InitialsComponent } from '../shared/initials/initials.component';
import { SupportTicket, TicketMsg } from 'src/app/Core/Models/ticket.models';
import { TINTS, CAT_ICON, statusLabel } from '../shared/support.data';
import { TicketStatusBadgeComponent } from '../shared/ticket-status-badge/ticket-status-badge.component';
import { BubbleComponent } from './Components/bubble/bubble.component';
import { MetaChipComponent } from './Components/meta-chip/meta-chip.component';
import { SupportSheetComponent } from './Components/support-sheet/support-sheet.component';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado, TicketMessage, StaffSimple } from 'src/app/Core/Models/ticket.models';
import { SupabaseStorageService } from 'src/app/Core/Services/supabase-storage.service';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ChatRealtimeService } from 'src/app/Core/Services/chat-realtime.service';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    InitialsComponent, TicketStatusBadgeComponent,
    MetaChipComponent, BubbleComponent, SupportSheetComponent,
  ],
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
})
export class TicketComponent implements OnInit, OnDestroy {
  iconBack      = ICON_BACK;
  iconDots      = ICON_DOTS_HORIZ;
  iconAssign    = ICON_PERSON_ADD;
  iconSwap      = ICON_SWAP;
  iconResolve   = ICON_CHECK_CIRCLE;
  iconAttach    = ICON_ATTACH;
  iconCheck     = ICON_CHECK;

  @ViewChild('threadEl') threadEl!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Datos del ticket (shape que usa el template)
  ticket: SupportTicket = {
    id: '', name: '', email: '', subject: '', cat: '',
    status: 'Nuevo', time: '', assigned: 'Sin asignar', msgs: [],
  };
  ticketId = '';

  msgs: TicketMsg[] = [];
  ticketDescription = '';
  status    = 'Nuevo';
  assigned  = 'Sin asignar';
  assignedId = '';
  reply     = '';
  sheet: 'estado' | 'asignar' | null = null;
  toast: string | null = null;

  staffOptions: StaffSimple[] = [];
  loading = true;
  selectedFile: File | null = null;
  uploadError = '';

  readonly statusOptions = ['Nuevo', 'En proceso', 'Resuelto'];

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private subs = new Subscription();
  /// ids ya renderizados (los mensajes se mapean a un shape sin id)
  private seenIds = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private storage: SupabaseStorageService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private chatRt: ChatRealtimeService,
  ) {}

  get isAdmin(): boolean { return this.authService.currentProfile()?.role === 'admin'; }

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.ticketId) { this.goBack(); return; }

    this.loadTicket();
    this.loadMessages();
    this.loadAgentes();

    // Tiempo real (sin polling): mensajes y cambios de estado al instante
    this.chatRt.joinTicket(this.ticketId).catch(() => { /* sin tiempo real igual funciona por HTTP */ });

    this.subs.add(this.chatRt.ticketMensaje$.subscribe(({ ticketId, mensaje }) => {
      if (ticketId.toLowerCase() !== this.ticketId.toLowerCase()) return;
      if (this.seenIds.has(mensaje.id)) return; // el propio ya vino por HTTP
      this.seenIds.add(mensaje.id);
      this.msgs = [...this.msgs, this.mapMsg(mensaje)];
      this.scrollDown();
    }));

    this.subs.add(this.chatRt.ticketActualizado$.subscribe((t) => {
      if (t.id.toLowerCase() !== this.ticketId.toLowerCase()) return;
      // Solo estado y asignación: el payload de un cambio de estado no trae
      // los datos del usuario y pisarlos dejaría la cabecera en blanco
      this.status          = statusLabel(t.status);
      this.ticket.status   = this.status;
      this.assigned        = t.assignedToName || 'Sin asignar';
      this.assignedId      = t.assignedTo || '';
      this.ticket.assigned = this.assigned;
    }));

    this.subs.add(this.chatRt.reconectado$.subscribe(() => this.loadMessages()));
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.subs.unsubscribe();
    this.chatRt.leave();
  }

  // ── Carga inicial ──────────────────────────────────────────

  private loadTicket(): void {
    this.ticketService.obtener(this.ticketId).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.mapFromResultado(res.returnValue);
        }
      },
      error: () => { this.loading = false; },
    });
  }

  private loadMessages(): void {
    this.ticketService.listarMensajes(this.ticketId).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.seenIds = new Set(res.returnValue.map(m => m.id));
          this.msgs = res.returnValue.map(m => this.mapMsg(m));
          this.scrollDown();
        }
      },
    });
  }

  private loadAgentes(): void {
    this.ticketService.listarAgentes().subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.staffOptions = res.returnValue;
        }
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────

  get tint(): string { return TINTS[0]; }
  get catIcon(): string { return CAT_ICON[this.ticket.cat] || ''; }
  get assignedLabel(): string { return this.assigned === 'Sin asignar' ? '—' : this.assigned; }
  get isResolved(): boolean { return this.status === 'Resuelto'; }
  get isClosed(): boolean   { return this.status === 'Cerrado'; }

  flash(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = msg;
    this.toastTimer = setTimeout(() => this.toast = null, 1800);
  }

  now(): string {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  private scrollDown(): void {
    setTimeout(() => {
      if (this.threadEl?.nativeElement) {
        this.threadEl.nativeElement.scrollTop = this.threadEl.nativeElement.scrollHeight;
      }
    }, 60);
  }

  // ── Acciones ───────────────────────────────────────────────

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

  async send(): Promise<void> {
    if ((!this.reply.trim() && !this.selectedFile) || this.isResolved || this.isClosed) return;
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
        this.uploadError = 'No se pudo subir el archivo. Intenta de nuevo.';
        return;
      }
    }

    this.ticketService.enviarMensaje(this.ticketId, body, fileUrl, fileName).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          if (!this.seenIds.has(res.returnValue.id)) {
            this.seenIds.add(res.returnValue.id);
            this.msgs = [...this.msgs, this.mapMsg(res.returnValue)];
          }
          if (this.status === 'Nuevo') { this.status = 'En proceso'; this.ticket.status = 'En proceso'; }
          this.scrollDown();
        }
      },
      error: () => { this.reply = body; },
    });
  }

  resolve(): void {
    if (this.isResolved) return;
    this.ticketService.cambiarEstado(this.ticketId, 'resuelto').subscribe({
      next: (res) => {
        if (!res.blnError) {
          this.status = 'Resuelto';
          this.ticket.status = 'Resuelto';
          this.flash('Ticket marcado como resuelto');
        }
      },
    });
  }

  pickStatus(s: string): void {
    const dbMap: Record<string, string> = { 'Nuevo': 'nuevo', 'En proceso': 'en_proceso', 'Resuelto': 'resuelto' };
    const dbStatus = dbMap[s] ?? s;
    this.ticketService.cambiarEstado(this.ticketId, dbStatus).subscribe({
      next: (res) => {
        if (!res.blnError) {
          this.status = s;
          this.ticket.status = s;
          this.flash('Estado: ' + s);
        }
      },
    });
  }

  pickAgent(staffId: string): void {
    const staff = this.staffOptions.find(s => s.id === staffId);
    if (!staff) return;

    this.ticketService.asignar(this.ticketId, staffId).subscribe({
      next: (res) => {
        if (!res.blnError) {
          this.assigned   = staff.displayName;
          this.assignedId = staffId;
          this.ticket.assigned = staff.displayName;
          this.flash('Asignado a ' + staff.displayName);
        }
      },
    });
  }

  onEnter(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.send();
  }

  goBack(): void {
    this.router.navigate(this.isAdmin ? ['/admin/tickets'] : ['/soporte/tickets']);
  }

  // ── Mapeo ──────────────────────────────────────────────────

  private mapFromResultado(t: TicketResultado): void {
    this.ticket = {
      id:       `#BR-${t.ticketNumber}`,
      name:     t.userDisplayName || t.userUsername || 'Usuario',
      email:    t.userEmail || '',
      subject:  t.subject,
      cat:      t.category,
      status:   statusLabel(t.status),
      time:     '',
      assigned: t.assignedToName || 'Sin asignar',
      msgs:     [],
    };
    this.status             = statusLabel(t.status);
    this.assigned           = t.assignedToName || 'Sin asignar';
    this.assignedId         = t.assignedTo || '';
    this.ticketDescription  = t.description || '';
  }

  private mapMsg(m: TicketMessage): TicketMsg {
    return {
      who:  m.senderRole === 'system' ? 'system'
          : (m.senderRole === 'soporte' || m.senderRole === 'admin') ? 'support'
          : 'user',
      name: m.senderName,
      text: m.body,
      t:    new Date(m.createdAt).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
      file: m.fileName ? { name: m.fileName, size: '', url: m.fileUrl ?? undefined } : undefined,
    };
  }
}
