import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido, fechaDeFase, motivoIncidencia } from 'src/app/Core/Models/store.models';
import { StoreAdminService } from '../../store-admin.service';

const MOTIVOS = ['Cliente no contesta', 'Dirección incorrecta', 'Zona de difícil acceso'];

/** Pedido en reparto (incidencia, código de entrega o cambio de fecha) y ya entregado. */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-store-delivery-panel',
  templateUrl: './admin-store-delivery-panel.component.html',
  styleUrls: ['./admin-store-delivery-panel.component.scss'],
})
export class AdminStoreDeliveryPanelComponent implements OnInit {
  private readonly ui = inject(StoreAdminService);

  @Input({ required: true }) pedido!: Pedido;
  readonly motivos = MOTIVOS;
  readonly estrellas = [1, 2, 3, 4, 5];
  motivo = MOTIVOS[0];
  codigoEntrada = '';
  ventanas: string[] = [];
  ventanaElegida = '';

  ngOnInit(): void {
    this.ventanas = this.ui.store.ventanasDisponibles();
    this.ventanaElegida = this.ventanas[0] ?? '';
  }

  fechaDe(p: Pedido, fase: number): string { return fechaDeFase(p, fase); }
  motivoReal(p: Pedido): string { return motivoIncidencia(p); }
  maxIntentos(): number { return this.ui.store.config().maxIntentosEntrega; }
  puedeRegistrarIncidencia(p: Pedido): boolean { return p.intentosFallidos < this.maxIntentos(); }

  async registrarIncidencia(p: Pedido): Promise<void> {
    await this.ui.ejecutar(this.ui.store.registrarIncidencia(p.no, this.motivo), `Incidencia registrada en ${p.no}.`);
  }
  async reprogramar(p: Pedido): Promise<void> {
    await this.ui.ejecutar(this.ui.store.reprogramar(p.no, this.ventanaElegida), `${p.no} reprogramado: ${this.ventanaElegida}.`);
  }
  async confirmarEntrega(p: Pedido): Promise<void> {
    if (await this.ui.ejecutar(this.ui.store.confirmarEntrega(p.no, this.codigoEntrada), `${p.no} entregado.`)) this.codigoEntrada = '';
  }
}
