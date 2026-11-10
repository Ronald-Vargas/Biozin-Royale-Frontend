import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { Producto } from 'src/app/Core/Models/store.models';
import { StoreAdminService } from '../../store-admin.service';
import { colorDe } from '../../store-admin.utils';

/** Productos: lista con precio, visibilidad, edición y eliminación. */
@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-admin-store-products',
  templateUrl: './admin-store-products.component.html',
  styleUrls: ['./admin-store-products.component.scss'],
})
export class AdminStoreProductsComponent {
  readonly ui = inject(StoreAdminService);
  readonly iconBuscar = ICON_SEARCH;

  colorDe = colorDe;
  trackId = (_: number, x: { id: string }) => x.id;

  async alternarVisible(id: string): Promise<void> {
    const r = await this.ui.store.alternarVisible(id);
    if (!r.ok) this.ui.mostrarAviso(r.error);
  }

  pedirEliminar(p: Producto): void {
    this.ui.pedirConfirmacion({
      titulo: `¿Eliminar ${p.nombre}?`,
      texto: 'El producto desaparecerá de la tienda y del inventario. Los pedidos anteriores conservan su historial. Esta acción no se puede deshacer.',
      ok: 'Eliminar producto',
      conservar: 'Conservar producto',
      accion: async () => {
        const r = await this.ui.store.eliminarProducto(p.id);
        this.ui.mostrarAviso(r.ok ? 'Producto eliminado.' : r.error);
      },
    });
  }
}
