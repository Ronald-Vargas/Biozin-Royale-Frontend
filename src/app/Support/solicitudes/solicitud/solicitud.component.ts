import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastMsgCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private internalRequestService: InternalRequestService,
    private authService: AuthService,
  ) {}

  get isAdmin(): boolean { return this.authService.currentProfile()?.role === 'admin'; }
  get isClosed(): boolean { return this.status === 'Resuelto' || this.status === 'Cerrado'; }
  get tint(): string { return TINTS[0]; }

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.requestId) { this.goBack(); return; }

    this.loadSolicitud();
    this.loadMessages();

    this.pollInterval = setInterval(() => this.pollMessages(), 4000);
  }

  ngOnDestroy(): void {
    if (this.toastTimer)   clearTimeout(this.toastTimer);
    if (this.pollInterval) clearInterval(this.pollInterval);
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
          this.msgs = res.returnValue.map(m => this.mapMsg(m));
          this.lastMsgCount = this.msgs.length;
          this.scrollDown();
        }
      },
    });
  }

  private pollMessages(): void {
    this.internalRequestService.listarMensajes(this.requestId).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue && res.returnValue.length !== this.lastMsgCount) {
          this.msgs = res.returnValue.map(m => this.mapMsg(m));
          this.lastMsgCount = this.msgs.length;
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
    if (!this.reply.trim()) return;
    const body = this.reply.trim();
    this.reply = '';

    this.internalRequestService.enviarMensaje(this.requestId, body).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.msgs = [...this.msgs, this.mapMsg(res.returnValue)];
          this.lastMsgCount = this.msgs.length;
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
