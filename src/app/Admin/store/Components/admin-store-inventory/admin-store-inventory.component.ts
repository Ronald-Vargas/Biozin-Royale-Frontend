import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreAdminService } from '../../store-admin.service';
import { colorDe, estadoStock } from '../../store-admin.utils';
import { AdminStoreKpiComponent } from '../admin-store-kpi/admin-store-kpi.component';

/** Inventario: unidades, valor y ajuste de stock (por talla en las prendas). */
@Component({
  standalone: true,
  imports: [CommonModule, AdminStoreKpiComponent],
  selector: 'app-admin-store-inventory',
  templateUrl: './admin-store-inventory.component.html',
  styleUrls: ['./admin-store-inventory.component.scss'],
})
export class AdminStoreInventoryComponent {
  readonly ui = inject(StoreAdminService);

  colorDe = colorDe;
  estadoStock = estadoStock;
  trackId = (_: number, x: { id: string }) => x.id;

  /** Ajusta el stock; en productos con talla se indica cuál. */
  async ajustar(id: string, delta: number, talla: string | null = null): Promise<void> {
    const r = await this.ui.store.ajustarStock(id, delta, talla);
    if (!r.ok) this.ui.mostrarAviso(r.error);
  }
}
