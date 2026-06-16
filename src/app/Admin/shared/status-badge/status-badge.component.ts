import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { STATUS_BADGE, StatusStyle } from '../admin.data';

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