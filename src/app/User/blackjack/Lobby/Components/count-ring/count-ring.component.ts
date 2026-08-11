import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fmtSecs } from '../../tables.data';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-count-ring',
  templateUrl: './count-ring.component.html',
  styleUrls: ['./count-ring.component.scss'],
})
export class CountRingComponent implements OnInit, OnDestroy, OnChanges {
  /** Segundos restantes; el padre los actualiza en vivo desde el servidor */
  @Input() secs = 0;
  @Input() caption = 'INICIA EN';
  /** true = la mesa tiene ronda en curso: anillo lleno, sin cuenta */
  @Input() playing = false;

  t = 0;
  readonly R = 34;
  readonly CIRC = 2 * Math.PI * 34;

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.t = this.secs;
    // Respaldo entre actualizaciones del padre: baja, nunca se reinicia solo
    this.timer = setInterval(() => {
      if (this.t > 0) this.t--;
    }, 1000);
  }

  ngOnChanges() { this.t = this.secs; }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  get urgent(): boolean { return !this.playing && this.t > 0 && this.t <= 20; }
  get pct(): number {
    if (this.playing) return 1;
    return this.secs > 0 ? this.t / Math.max(this.secs, 1) : 0;
  }
  get color(): string { return this.urgent ? '#4fd190' : '#c79a32'; }
  get dashOffset(): number { return this.CIRC * (1 - this.pct); }
  get label(): string { return this.playing ? '♠' : fmtSecs(this.t); }
}
