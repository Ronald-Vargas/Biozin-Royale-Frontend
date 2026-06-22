import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_BACK, ICON_PERSON_ADD, ICON_CHECK, ICON_ATTACH, ICON_CHECK_CIRCLE, ICON_DOTS_HORIZ, ICON_SWAP } from 'src/app/User/shared/icons/icons';
import { InitialsComponent } from '../shared/initials/initials.component';
import { SupportTicket, TicketMsg, AGENTS, SUPPORT_TICKETS, TINTS, CAT_ICON } from '../shared/support.data';
import { TicketStatusBadgeComponent } from '../shared/ticket-status-badge/ticket-status-badge.component';
import { BubbleComponent } from './Components/bubble/bubble.component';
import { MetaChipComponent } from './Components/meta-chip/meta-chip.component';
import { SupportSheetComponent } from './Components/support-sheet/support-sheet.component';


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

  ticket!: SupportTicket;
  msgs: TicketMsg[] = [];
  status    = 'Abierto';
  assigned  = 'Sin asignar';
  reply     = '';
  sheet: 'estado' | 'asignar' | null = null;
  toast: string | null = null;

  readonly statusOptions = ['Abierto', 'En proceso', 'Resuelto'];
  readonly agents = AGENTS;

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.ticket = SUPPORT_TICKETS.find(t => t.id === id) || SUPPORT_TICKETS[0];
    this.msgs     = [...this.ticket.msgs];
    this.status   = this.ticket.status === 'Nuevo' ? 'Abierto' : this.ticket.status;
    this.assigned = this.ticket.assigned;
  }

  ngOnDestroy() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // ── Helpers ────────────────────────────────────────────────
  get tint(): string { return TINTS[0]; }
  get catIcon(): string { return CAT_ICON[this.ticket.cat] || ''; }
  get assignedLabel(): string { return this.assigned === 'Sin asignar' ? '—' : this.assigned; }
  get isResolved(): boolean { return this.status === 'Resuelto'; }

  flash(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = msg;
    this.toastTimer = setTimeout(() => this.toast = null, 1800);
  }

  now(): string {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  private scrollDown() {
    setTimeout(() => {
      if (this.threadEl?.nativeElement) {
        this.threadEl.nativeElement.scrollTop = this.threadEl.nativeElement.scrollHeight;
      }
    }, 60);
  }

  // ── Acciones ───────────────────────────────────────────────
  send() {
    if (!this.reply.trim()) return;
    const nm: TicketMsg = {
      who:  'support',
      name: this.assigned === 'Sin asignar' ? 'Tú' : this.assigned,
      text: this.reply.trim(),
      t:    this.now(),
    };
    this.msgs = [...this.msgs, nm];
    this.ticket.msgs = this.msgs;
    this.reply = '';
    if (this.status === 'Abierto' || this.status === 'Nuevo') {
      this.status = 'En proceso';
      this.ticket.status = 'En proceso';
    }
    this.scrollDown();
  }

  resolve() {
    if (this.isResolved) return;
    this.status = 'Resuelto';
    this.ticket.status = 'Resuelto';
    this.flash('Ticket marcado como resuelto');
  }

  pickStatus(s: string) {
    this.status = s;
    this.ticket.status = s === 'Abierto' ? 'Nuevo' : s;
    this.flash('Estado: ' + s);
  }

  pickAgent(a: string) {
    this.assigned = a;
    this.ticket.assigned = a;
    if (a !== 'Sin asignar' && this.status === 'Abierto') {
      this.status = 'Asignado';
      this.ticket.status = 'Asignado';
    }
    this.flash(a === 'Sin asignar' ? 'Sin asignar' : 'Asignado a ' + a);
  }

  onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter') this.send();
  }

  goBack() { this.router.navigate(['/soporte/tickets']); }
}