import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreAdminService } from '../../store-admin.service';
import { AdminStoreKpiComponent } from '../admin-store-kpi/admin-store-kpi.component';
import { AdminStoreOrderListComponent } from '../admin-store-order-list/admin-store-order-list.component';

/** Logística: tablero de pedidos activos agrupados por la etapa que toca atender. */
@Component({
  standalone: true,
  imports: [CommonModule, AdminStoreKpiComponent, AdminStoreOrderListComponent],
  selector: 'app-admin-store-logistics',
  templateUrl: './admin-store-logistics.component.html',
  styleUrls: ['./admin-store-logistics.component.scss'],
})
export class AdminStoreLogisticsComponent {
  readonly ui = inject(StoreAdminService);
  readonly corte = computed(() => this.ui.store.config().corte);

  /** Cantidad de pedidos que todavía requieren algo del equipo. */
  readonly activos = computed(() => {
    const c = this.ui.cuenta();
    return c['Por verificar pago'] + this.ui.enPreparacion() + c['Por despachar'] + c['En ruta'] + c['Incidencias'];
  });
}
