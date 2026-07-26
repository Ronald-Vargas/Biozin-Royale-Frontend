import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TK_STATUS } from '../support.data';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-ticket-status-badge',
  templateUrl: './ticket-status-badge.component.html',
  styleUrls: ['./ticket-status-badge.component.scss'],
})
export class TicketStatusBadgeComponent {
  @Input() status = 'Nuevo';
  @Input() size: 'sm' | 'lg' = 'sm';

  get style(): { color: string; bg: string; bd: string } {
    return TK_STATUS[this.status] || TK_STATUS['Nuevo'];
  }

  get isLg(): boolean { return this.size === 'lg'; }
}