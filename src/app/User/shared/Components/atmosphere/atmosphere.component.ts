import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Dot {
  left: number; top: number; size: number;
  dur: number; delay: number; op: number; blur: number;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-atmosphere',
  templateUrl: './atmosphere.component.html',
  styleUrls: ['./atmosphere.component.scss'],
})
export class AtmosphereComponent implements OnInit {
  @Input() glow  = 0.55;
  @Input() count = 16;
  dots: Dot[] = [];

  ngOnInit(): void {
    this.dots = Array.from({ length: this.count }, () => ({
      left:  Math.random() * 100,
      top:   40 + Math.random() * 60,
      size:  2 + Math.random() * 6,
      dur:   7 + Math.random() * 9,
      delay: -Math.random() * 12,
      op:    0.15 + Math.random() * 0.5,
      blur:  Math.random() > 0.6 ? 2 : 0.5,
    }));
  }
}