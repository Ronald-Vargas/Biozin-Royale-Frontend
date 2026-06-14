import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-chip-token',
  templateUrl: './chip-token.component.html',
  styleUrls: ['./chip-token.component.scss'],
})
export class ChipTokenComponent {
  @Input() amount = 0;
  @Input() size = 46;

  // Elige el arte de ficha más cercano <= amount
  get denom(): number {
    return [100, 25, 10, 5, 1].find(d => this.amount >= d) || 1;
  }

  get img(): string { return `assets/chip-${this.denom}.png`; }

  get tokenStyle(): { [k: string]: string } {
    return { width: this.size + 'px', height: this.size + 'px' };
  }

  get valueSize(): string { return (this.size * 0.3) + 'px'; }
}