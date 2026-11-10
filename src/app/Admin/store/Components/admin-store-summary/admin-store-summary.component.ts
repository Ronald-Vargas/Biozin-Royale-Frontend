import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreNoticeListComponent } from 'src/app/User/shared/Components/store-notice-list/store-notice-list.component';
import { StoreAdminService } from '../../store-admin.service';
import { estadoStock } from '../../store-admin.utils';
import { AdminStoreKpiComponent } from '../admin-store-kpi/admin-store-kpi.component';
import { AdminStoreOrderListComponent } from '../admin-store-order-list/admin-store-order-list.component';

/** Resumen: ventas, pedidos que piden acción, avisos, últimos movimientos y stock bajo. */
@Component({
  standalone: true,
  imports: [CommonModule, StoreNoticeListComponent, AdminStoreKpiComponent, AdminStoreOrderListComponent],
  selector: 'app-admin-store-summary',
  templateUrl: './admin-store-summary.component.html',
  styleUrls: ['./admin-store-summary.component.scss'],
})
export class AdminStoreSummaryComponent {
  readonly ui = inject(StoreAdminService);
  readonly store = this.ui.store;

  estadoStock = estadoStock;
  trackId = (_: number, x: { id: string }) => x.id;
}
