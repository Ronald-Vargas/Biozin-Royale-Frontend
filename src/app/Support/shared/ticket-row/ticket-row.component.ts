import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitialsComponent }          from '../initials/initials.component';
import { TicketStatusBadgeComponent } from '../ticket-status-badge/ticket-status-badge.component';
import { PrioTagComponent }           from '../prio-tag/prio-tag.component';
import { SupportTicket, TINTS } from '../support.data';

@Component({
  standalone: true,
  imports: [CommonModule, InitialsComponent, TicketStatusBadgeComponent, PrioTagComponent],
  selector: 'app-ticket-row',
  templateUrl: './ticket-row.component.html',
  styleUrls: ['./ticket-row.component.scss'],
})
export class TicketRowComponent {
  @Input() ticket!: SupportTicket;
  @Input() idx = 0;
  @Output() open = new EventEmitter<string>();

  get tint(): string { return TINTS[this.idx % TINTS.length]; }
}
