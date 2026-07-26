import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatusStyle { color: string; bg: string; bd: string; }

const STATUS_BADGE: Record<string, StatusStyle> = {
  Activo:    { color: '#62d89b', bg: 'rgba(63,174,110,0.18)',   bd: 'rgba(63,174,110,0.55)' },
  Inactivo:  { color: '#ec8a8a', bg: 'rgba(224,106,106,0.16)',  bd: 'rgba(224,106,106,0.5)' },
  Bloqueado: { color: '#e98a85', bg: 'rgba(199, 62, 58, 0.18)', bd: 'rgba(214, 77, 72, 0.6)' },
};

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  @Input() status = 'Activo';

  get style(): StatusStyle {
    return STATUS_BADGE[this.status] || STATUS_BADGE['Activo'];
  }
}