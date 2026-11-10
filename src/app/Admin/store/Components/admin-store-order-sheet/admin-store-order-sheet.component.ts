import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido, etapaActual, puedeCancelar, textoMetodo, textoPago, totalPedido } from 'src/app/Core/Models/store.models';
import { StoreAdminService } from '../../store-admin.service';
import { claseGrupo } from '../../store-admin.utils';
import { AdminStoreDeliveryPanelComponent } from '../admin-store-delivery-panel/admin-store-delivery-panel.component';
import { AdminStoreOrderLogComponent } from '../admin-store-order-log/admin-store-order-log.component';
import { AdminStorePaymentReviewComponent } from '../admin-store-payment-review/admin-store-payment-review.component';
import { AdminStorePrepPanelComponent } from '../admin-store-prep-panel/admin-store-prep-panel.component';
import { AdminStoreShippingPanelComponent } from '../admin-store-shipping-panel/admin-store-shipping-panel.component';

/**
 * Hoja de un pedido: datos del cliente, artículos y el panel de la etapa en la que está
 * (verificar pago, preparar, despachar, entregar), más la bitácora.
 */
@Component({
  standalone: true,
  imports: [
    CommonModule, AdminStorePaymentReviewComponent, AdminStorePrepPanelComponent,
    AdminStoreShippingPanelComponent, AdminStoreDeliveryPanelComponent, AdminStoreOrderLogComponent,
  ],
  selector: 'app-admin-store-order-sheet',
  templateUrl: './admin-store-order-sheet.component.html',
  styleUrls: ['./admin-store-order-sheet.component.scss'],
})
export class AdminStoreOrderSheetComponent {
  readonly ui = inject(StoreAdminService);

  total(p: Pedido): number { return totalPedido(p); }
  etapa(p: Pedido) { return etapaActual(p); }
  claseGrupo(p: Pedido): string { return claseGrupo(p); }
  textoPago(p: Pedido): string { return textoPago(p); }
  metodoTexto(p: Pedido): string { return textoMetodo(p); }
  puedeCancelar(p: Pedido): boolean { return puedeCancelar(p, 'admin'); }

  pedirCancelar(p: Pedido): void {
    this.ui.pedirConfirmacion({
      titulo: `¿Cancelar el pedido ${p.no}?`,
      texto: 'Las unidades volverán al inventario y, si ya estaba pagado, se reembolsa al cliente. Esta acción no se puede deshacer.',
      ok: 'Cancelar pedido',
      conservar: 'Conservar pedido',
      accion: async () => {
        await this.ui.ejecutar(this.ui.store.cancelar(p.no), `Pedido ${p.no} cancelado.`);
      },
    });
  }
}
