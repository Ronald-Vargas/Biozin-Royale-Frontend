import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evento, Pedido } from 'src/app/Core/Models/store.models';

/** Bitácora del pedido: qué pasó, quién lo hizo y cuándo (lo más reciente primero). */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin-store-order-log',
  templateUrl: './admin-store-order-log.component.html',
  styleUrls: ['./admin-store-order-log.component.scss'],
})
export class AdminStoreOrderLogComponent {
  @Input({ required: true }) pedido!: Pedido;

  get eventos(): Evento[] {
    return [...this.pedido.eventos].reverse();
  }
}
