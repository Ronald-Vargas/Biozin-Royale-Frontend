import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-total-badge',
  templateUrl: './total-badge.component.html',
  styleUrls: ['./total-badge.component.scss'],
})
export class TotalBadgeComponent {
  @Input() value = 0;
  @Input() tone: 'dark' | 'win' | 'bust' = 'dark';
  @Input() size = 26;

  get bg(): string {
    if (this.tone === 'win')  return 'linear-gradient(180deg,#2e8b57,#176b39)';
    if (this.tone === 'bust') return 'linear-gradient(180deg,#c0392b,#8a1d15)';
    return 'linear-gradient(180deg,#222,#0c0c0c)';
  }

  get badgeStyle(): { [k: string]: string } {
    return {
      'min-width': this.size + 'px',
      height:      this.size + 'px',
      background:  this.bg,
      'font-size': (this.size * 0.5) + 'px',
    };
  }
}