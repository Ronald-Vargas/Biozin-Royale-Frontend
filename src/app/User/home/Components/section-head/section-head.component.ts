import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-section-head',
  template: `
    <div class="section-head">
      <span class="section-title">{{ title }}</span>
      <span class="section-action" (click)="action.emit()">{{ actionLabel }}</span>
    </div>
  `,
  styles: [`
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 0 13px;
    }
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 14px;
      letter-spacing: 1.5px;
      color: var(--cream);
      font-weight: 600;
      text-transform: uppercase;
    }
    .section-action {
      font-size: 13px;
      letter-spacing: 1px;
      color: var(--gold-2);
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
    }
  `]
})
export class SectionHeadComponent {
  @Input()  title       = '';
  @Input()  actionLabel = 'Ver todo';
  @Output() action      = new EventEmitter<void>();
}