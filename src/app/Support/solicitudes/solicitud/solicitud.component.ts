import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_BACK, ICON_CHECK, ICON_CHECK_CIRCLE, ICON_PERSON_CIRCLE, ICON_SWAP } from 'src/app/User/shared/icons/icons';
import { InitialsComponent } from 'src/app/Support/shared/initials/initials.component';
import { TicketMsg } from 'src/app/Core/Models/ticket.models';
import { TINTS, statusLabel } from 'src/app/Support/shared/support.data';
import { TicketStatusBadgeComponent } from 'src/app/Support/shared/ticket-status-badge/ticket-status-badge.component';
import { BubbleComponent } from 'src/app/Support/ticket/Components/bubble/bubble.component';
import { MetaChipComponent } from 'src/app/Support/ticket/Components/meta-chip/meta-chip.component';
import { SupportSheetComponent } from 'src/app/Support/ticket/Components/support-sheet/support-sheet.component';
import { InternalRequestService } from 'src/app/Core/Services/internal-request.service';
import { InternalRequestResultado, InternalRequestMessage } from 'src/app/Core/Models/internal-request.models';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ChatRealtimeService } from 'src/app/Core/Services/chat-realtime.service';
import { SoundService } from 'src/app/Core/Services/sound.service';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    InitialsComponent, TicketStatusBadgeComponent,
    MetaChipComponent, BubbleComponent, SupportSheetComponent,
  ],
  selector: 'app-solicitud',
  templateUrl: './solicitud.component.html',
  styleUrls: ['./solicitud.component.scss'],
})
export class SolicitudComponent implements OnInit, OnDestroy {
  iconBack     = ICON_BACK;
  iconSwap     = ICON_SWAP;
  iconResolve  = ICON_CHECK_CIRCLE;
  iconCheck    = ICON_CHECK;
  iconAdmin    = ICON_PERSON_CIRCLE;

  @ViewChild('threadEl') threadEl!: ElementRef<HTMLDivElement>;

  requestId = '';
  requestNumber = 0;
  subject = '';
  description = '';
  requestedByName = '';
  targetAdminName = '';
  status = 'Nuevo';

  msgs: TicketMsg[] = [];
  reply = '';
  sheet: 'estado' | null = null;
  toast: string | null = null;
  loading = true;

  readonly statusOptions = ['Nuevo', 'En proceso', 'Resuelto', 'Cerrado'];

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private subs = new Subscription();
  /// ids ya renderizados (los mensajes se mapean a un shape sin id)
  private seenIds = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private internalRequestService: InternalRequestService,
    private authService: AuthService,
    private chatRt: ChatRealtimeService,
    private soundService: SoundService,
  ) {}

  get isAdmin(): boolean { return this.authService.currentProfile()?.role === 'admin'; }
  get isClosed(): boolean { return this.status === 'Resuelto' || this.status === 'Cerrado'; }
  get tint(): string { return TINTS[0]; }

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.requestId) { this.goBack(); return; }

    this.loadSolicitud();
    this.loadMessages();

    // Tiempo real (sin polling): mensajes y cambios de estado al instante
    // Si falla, el chat sigue usable por HTTP pero sin actualizaciones en vivo:
    // se registra para que el problema sea diagnosticable y no pase inadvertido.
    this.chatRt.joinSolicitud(this.requestId)
      .catch(err => console.warn('[chat] sin tiempo real en la solicitud:', err));

    this.subs.add(this.chatRt.solicitudMensaje$.subscribe(({ solicitudId, mensaje }) => {
      if (solicitudId.toLowerCase() !== this.requestId.toLowerCase()) return;
      if (this.seenIds.has(mensaje.id)) return; // el propio ya vino por HTTP
      this.seenIds.add(mensaje.id);
      this.msgs = [...this.msgs, this.mapMsg(mensaje)];
      this.soundService.play('notification');
      this.scrollDown();
    }));

    this.subs.add(this.chatRt.solicitudActualizada$.subscribe((r) => {
      if (r.id.toLowerCase() === this.requestId.toLowerCase()) this.status = statusLabel(r.status);
    }));

    this.subs.add(this.chatRt.reconectado$.subscribe(() => this.loadMessages()));
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.subs.unsubscribe();
    this.chatRt.leaveSolicitud(this.requestId);
  }

  // ── Carga inicial ──────────────────────────────────────────

  private loadSolicitud(): void {
    this.internalRequestService.obtener(this.requestId).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) this.mapFromResultado(res.returnValue);
      },
      error: () => { this.loading = false; },
    });
  }

  private loadMessages(): void {
    this.internalRequestService.listarMensajes(this.requestId).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.seenIds = new Set(res.returnValue.map(m => m.id));
          this.msgs = res.returnValue.map(m => this.mapMsg(m));
          this.scrollDown();
        }
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────

  flash(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = msg;
    this.toastTimer = setTimeout(() => this.toast = null, 1800);
  }

  private scrollDown(): void {
    setTimeout(() => {
      if (this.threadEl?.nativeElement) {
        this.threadEl.nativeElement.scrollTop = this.threadEl.nativeElement.scrollHeight;
      }
    }, 60);
  }

  // ── Acciones ───────────────────────────────────────────────

  send(): void {
    if (!this.reply.trim() || this.isClosed) return;
    const body = this.reply.trim();
    this.reply = '';

    this.internalRequestService.enviarMensaje(this.requestId, body).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          if (!this.seenIds.has(res.returnValue.id)) {
            this.seenIds.add(res.returnValue.id);
            this.msgs = [...this.msgs, this.mapMsg(res.returnValue)];
          }
          if (this.isAdmin && this.status === 'Nuevo') this.status = 'En proceso';
          this.scrollDown();
        }
      },
      error: () => { this.reply = body; },
    });
  }

  resolve(): void {
    if (this.status === 'Resuelto') return;
    this.internalRequestService.cambiarEstado(this.requestId, 'resuelto').subscribe({
      next: (res) => {
        if (!res.blnError) {
          this.status = 'Resuelto';
          this.flash('Solicitud marcada como resuelta');
        }
      },
    });
  }

  pickStatus(s: string): void {
    const dbMap: Record<string, string> = { 'Nuevo': 'nuevo', 'En proceso': 'en_proceso', 'Resuelto': 'resuelto', 'Cerrado': 'cerrado' };
    const dbStatus = dbMap[s] ?? s;
    this.internalRequestService.cambiarEstado(this.requestId, dbStatus).subscribe({
      next: (res) => {
        if (!res.blnError) {
          this.status = s;
          this.flash('Estado: ' + s);
        }
      },
    });
  }

  onEnter(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.send();
  }

  goBack(): void {
    this.router.navigate(this.isAdmin ? ['/admin/solicitudes'] : ['/soporte/solicitudes']);
  }

  // ── Mapeo ──────────────────────────────────────────────────

  private mapFromResultado(r: InternalRequestResultado): void {
    this.requestNumber    = r.requestNumber;
    this.subject          = r.subject;
    this.description      = r.description;
    this.requestedByName  = r.requestedByName || 'Soporte';
    this.targetAdminName  = r.targetAdminName || 'Admin';
    this.status           = statusLabel(r.status);
  }

  private mapMsg(m: InternalRequestMessage): TicketMsg {
    return {
      who:  m.senderRole === 'system' ? 'system'
          : m.senderRole === 'admin' ? 'support'
          : 'user',
      name: m.senderName,
      text: m.body,
      t:    new Date(m.createdAt).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
