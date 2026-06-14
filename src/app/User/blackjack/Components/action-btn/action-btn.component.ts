import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-action-btn',
  templateUrl: './action-btn.component.html',
  styleUrls: ['./action-btn.component.scss'],
})
export class ActionBtnComponent {
  @Input() icon = '';
  @Input() label = '';
  @Input() txt = '';
  @Input() on = false;
  @Input() accent = '';
  @Output() act = new EventEmitter<void>();

  get color(): string {
    if (!this.on) return '#5a5240';
    return this.accent || 'var(--gold-1)';
  }

  get borderColor(): string {
    if (!this.on) return 'rgba(212,167,60,0.14)';
    return this.accent ? this.accent + '88' : 'rgba(212,167,60,0.45)';
  }

  get bg(): string {
    return this.on ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.012)';
  }

  onClick() {
    if (this.on) this.act.emit();
  }
}