import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido, fechaDeFase } from 'src/app/Core/Models/store.models';
import { StoreAdminService } from '../../store-admin.service';

const MOTIVOS = ['Cliente no contesta', 'Dirección incorrecta', 'Zona de difícil acceso'];

/** Pedido en reparto (incidencia o entrega con el código del cliente) y ya entregado. */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-store-delivery-panel',
  templateUrl: './admin-store-delivery-panel.component.html',
  styleUrls: ['./admin-store-delivery-panel.component.scss'],
})
export class AdminStoreDeliveryPanelComponent {
  private readonly ui = inject(StoreAdminService);

  @Input({ required: true }) pedido!: Pedido;
  readonly motivos = MOTIVOS;
  readonly estrellas = [1, 2, 3, 4, 5];
  motivo = MOTIVOS[0];
  codigoEntrada = '';

  fechaDe(p: Pedido, fase: number): string { return fechaDeFase(p, fase); }

  async registrarIncidencia(p: Pedido): Promise<void> {
    await this.ui.ejecutar(this.ui.store.registrarIncidencia(p.no, this.motivo), `Incidencia registrada en ${p.no}.`);
  }
  async reprogramarPorCliente(p: Pedido): Promise<void> {
    const ventana = this.ui.store.ventanasDisponibles()[0];
    await this.ui.ejecutar(this.ui.store.reprogramar(p.no, ventana), `${p.no} reprogramado: ${ventana}.`);
  }
  async confirmarEntrega(p: Pedido): Promise<void> {
    if (await this.ui.ejecutar(this.ui.store.confirmarEntrega(p.no, this.codigoEntrada), `${p.no} entregado.`)) this.codigoEntrada = '';
  }
}
