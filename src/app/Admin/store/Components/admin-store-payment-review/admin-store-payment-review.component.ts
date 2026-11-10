import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido, totalPedido } from 'src/app/Core/Models/store.models';
import { StoreAdminService } from '../../store-admin.service';

/** Pago con tarjeta por verificar: el admin lo confirma o lo rechaza. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin-store-payment-review',
  templateUrl: './admin-store-payment-review.component.html',
  styleUrls: ['./admin-store-payment-review.component.scss'],
})
export class AdminStorePaymentReviewComponent {
  private readonly ui = inject(StoreAdminService);

  @Input({ required: true }) pedido!: Pedido;

  total(p: Pedido): number { return totalPedido(p); }

  async confirmar(p: Pedido): Promise<void> {
    await this.ui.ejecutar(this.ui.store.confirmarPago(p.no), `Pago de ${p.no} confirmado.`);
  }
  pedirRechazo(p: Pedido): void {
    this.ui.pedirConfirmacion({
      titulo: `¿Rechazar el pago de ${p.no}?`,
      texto: 'El pedido se cancela, las unidades vuelven al inventario y el cliente recibe un aviso. Esta acción no se puede deshacer.',
      ok: 'Rechazar pago',
      conservar: 'Volver',
      accion: async () => {
        await this.ui.ejecutar(this.ui.store.rechazarPago(p.no), `Pago de ${p.no} rechazado.`);
      },
    });
  }
}
