import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ItemLinea { titulo: string; detalle: string; clase: 'on' | 'now' | 'off' | 'warn'; }

/** Línea de tiempo vertical con los hitos del pedido. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-store-timeline',
  templateUrl: './store-timeline.component.html',
  styleUrls: ['./store-timeline.component.scss'],
})
export class StoreTimelineComponent {
  @Input({ required: true }) items: ItemLinea[] = [];
}
