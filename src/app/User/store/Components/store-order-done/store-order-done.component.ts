import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from 'src/app/Core/Services/store.service';
import { Pedido, textoPago, totalPedido } from 'src/app/Core/Models/store.models';
import { StoreNavService } from '../../store-nav.service';

/** Confirmación de que el pedido quedó registrado. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-store-order-done',
  templateUrl: './store-order-done.component.html',
  styleUrls: ['./store-order-done.component.scss'],
})
export class StoreOrderDoneComponent {
  private readonly store = inject(StoreService);
  readonly nav = inject(StoreNavService);

  readonly pedido = computed(() => this.store.pedidos().find(p => p.no === this.nav.pedidoNo()) ?? null);

  textoPago(p: Pedido): string { return textoPago(p); }
  totalDe(p: Pedido): number { return totalPedido(p); }
}
