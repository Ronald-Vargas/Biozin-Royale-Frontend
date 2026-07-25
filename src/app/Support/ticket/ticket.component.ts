import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_BACK, ICON_PERSON_ADD, ICON_CHECK, ICON_ATTACH, ICON_CHECK_CIRCLE, ICON_DOTS_HORIZ, ICON_SWAP } from 'src/app/User/shared/icons/icons';
import { InitialsComponent } from '../shared/initials/initials.component';
import { SupportTicket, TicketMsg, TINTS, CAT_ICON, statusLabel } from '../shared/support.data';
import { TicketStatusBadgeComponent } from '../shared/ticket-status-badge/ticket-status-badge.component';
import { BubbleComponent } from './Components/bubble/bubble.component';
import { MetaChipComponent } from './Components/meta-chip/meta-chip.component';
import { SupportSheetComponent } from './Components/support-sheet/support-sheet.component';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado, TicketMessage, StaffSimple } from 'src/app/Core/Models/ticket.models';

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

  readonly statusOptions = ['Nuevo', 'En proceso', 'Resuelto'];

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastMsgCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
  ) {}

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.ticketId) { this.goBack(); return; }

    this.loadTicket();
    this.loadMessages();
    this.loadAgentes();

    this.pollInterval = setInterval(() => this.pollMessages(), 4000);
  }

  ngOnDestroy(): void {
    if (this.toastTimer)  clearTimeout(this.toastTimer);
    if (this.pollInterval) clearInterval(this.pollInterval);
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
          this.msgs = res.returnValue.map(m => this.mapMsg(m));
          this.lastMsgCount = this.msgs.length;
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

  private pollMessages(): void {
    this.ticketService.listarMensajes(this.ticketId).subscribe({
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

  get tint(): string { return TINTS[0]; }
  get catIcon(): string { return CAT_ICON[this.ticket.cat] || ''; }
  get assignedLabel(): string { return this.assigned === 'Sin asignar' ? '—' : this.assigned; }
  get isResolved(): boolean { return this.status === 'Resuelto'; }

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

  send(): void {
    if (!this.reply.trim()) return;
    const body = this.reply.trim();
    this.reply = '';

    this.ticketService.enviarMensaje(this.ticketId, body).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.msgs = [...this.msgs, this.mapMsg(res.returnValue)];
          this.lastMsgCount = this.msgs.length;
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

  goBack(): void { this.router.navigate(['/soporte/tickets']); }

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
      who:  (m.senderRole === 'soporte' || m.senderRole === 'admin') ? 'support' : 'user',
      name: m.senderName,
      text: m.body,
      t:    new Date(m.createdAt).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
