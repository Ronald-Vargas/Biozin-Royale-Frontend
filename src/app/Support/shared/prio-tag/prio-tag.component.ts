import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TK_PRIO } from '../support.data';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-prio-tag',
  templateUrl: './prio-tag.component.html',
  styleUrls: ['./prio-tag.component.scss'],
})
export class PrioTagComponent {
  @Input() prio = 'Media';

  get color(): string { return TK_PRIO[this.prio] || TK_PRIO['Media']; }
  get glow(): string { return `0 0 5px ${this.color}`; }
}