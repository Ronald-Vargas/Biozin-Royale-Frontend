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
  @Input() secs = 60;

  t = 60;
  readonly R = 34;
  readonly CIRC = 2 * Math.PI * 34;

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.t = this.secs;
    this.timer = setInterval(() => {
      this.t = this.t > 0 ? this.t - 1 : this.secs;
    }, 1000);
  }

  ngOnChanges() { this.t = this.secs; }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  get urgent(): boolean { return this.t <= 20; }
  get pct(): number { return this.t / Math.max(this.secs, 1); }
  get color(): string { return this.urgent ? '#4fd190' : '#c79a32'; }
  get dashOffset(): number { return this.CIRC * (1 - this.pct); }
  get label(): string { return fmtSecs(this.t); }
}