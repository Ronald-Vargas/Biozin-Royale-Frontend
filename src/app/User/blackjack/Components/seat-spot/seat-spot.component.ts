import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-seat-spot',
  templateUrl: './seat-spot.component.html',
  styleUrls: ['./seat-spot.component.scss'],
})
export class SeatSpotComponent {
  @Input() active = false;
  @Input() win = false;

  get borderColor(): string {
    if (this.win)    return 'rgba(79,209,144,0.7)';
    if (this.active) return 'rgba(247,226,154,0.8)';
    return 'rgba(212,167,60,0.4)';
  }

  get boxShadow(): string {
    if (this.win)    return '0 0 16px rgba(79,209,144,0.4) inset';
    if (this.active) return '0 0 16px rgba(247,226,154,0.3) inset';
    return 'none';
  }
}