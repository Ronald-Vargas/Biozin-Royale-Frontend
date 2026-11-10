import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from 'src/app/Core/Models/store.models';
import { StoreAdminService } from '../../store-admin.service';

/** Pedido empacado (generar guía) y con el transportista (etiqueta y paso a reparto). */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin-store-shipping-panel',
  templateUrl: './admin-store-shipping-panel.component.html',
  styleUrls: ['./admin-store-shipping-panel.component.scss'],
})
export class AdminStoreShippingPanelComponent {
  private readonly ui = inject(StoreAdminService);

  @Input({ required: true }) pedido!: Pedido;
  readonly corte = computed(() => this.ui.store.config().corte);

  /** Genera la guía y entrega el pedido a Correos de Costa Rica. */
  async despachar(p: Pedido): Promise<void> {
    await this.ui.ejecutar(this.ui.store.despachar(p.no), `Guía generada para ${p.no}.`);
  }
  async iniciarReparto(p: Pedido): Promise<void> {
    await this.ui.ejecutar(this.ui.store.iniciarReparto(p.no), `${p.no} salió a reparto.`);
  }

  /** Cuadrícula tipo QR para la etiqueta de envío (simulada, a partir de la guía). */
  qr(semilla: string): { x: number; y: number }[] {
    let s = 0;
    for (const c of semilla) s = (s * 31 + c.charCodeAt(0)) >>> 0;
    const celdas: { x: number; y: number }[] = [];
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        s = (s * 1103515245 + 12345) >>> 0;
        const esquina = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
        if (esquina || (s >>> 16) % 2) celdas.push({ x: x * 10, y: y * 10 });
      }
    }
    return celdas;
  }
}
