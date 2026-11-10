import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from 'src/app/Core/Services/store.service';
import { Pedido, etapaActual, totalPedido } from 'src/app/Core/Models/store.models';
import { StoreNoticeListComponent } from 'src/app/User/shared/Components/store-notice-list/store-notice-list.component';
import { StoreNavService } from '../../store-nav.service';

/** Mis pedidos: avisos recientes y lista de pedidos con su estado. */
@Component({
  standalone: true,
  imports: [CommonModule, StoreNoticeListComponent],
  selector: 'app-store-my-orders',
  templateUrl: './store-my-orders.component.html',
  styleUrls: ['./store-my-orders.component.scss'],
})
export class StoreMyOrdersComponent {
  readonly store = inject(StoreService);
  readonly nav = inject(StoreNavService);

  readonly noLeidas = computed(() => this.store.notificaciones().filter(n => !n.leida).length);

  etapa(p: Pedido) { return etapaActual(p); }
  totalDe(p: Pedido): number { return totalPedido(p); }
  trackNo = (_: number, p: Pedido) => p.no;
}
