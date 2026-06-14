import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-seat-badge',
  templateUrl: './seat-badge.component.html',
  styleUrls: ['./seat-badge.component.scss'],
})
export class SeatBadgeComponent {
  @Input() num = 1;
  @Input() name = '';
  @Input() balance = 0;
  @Input() avatar = '';
  @Input() bet = 0;
  @Input() align: 'left' | 'right' = 'left';

  get isRight(): boolean { return this.align === 'right'; }

  fmtBalance(): string {
    const v = '$' + Number(this.balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return v.replace('.00', '');
  }
}