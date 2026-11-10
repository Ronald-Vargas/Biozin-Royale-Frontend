import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria, Pedido } from 'src/app/Core/Models/store.models';
import { StoreAdminService } from '../../store-admin.service';

const CAJAS = ['Caja S', 'Caja M', 'Caja L'];
const ESTANTES: Record<Categoria, string> = {
  Camisetas: 'Estante A', 'Sudaderas y gorras': 'Estante B', Accesorios: 'Estante C', Hogar: 'Estante D', Juegos: 'Estante E',
};

/** Pedido por preparar (empezar) y en preparación (sacar de bodega y empacar). */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-store-prep-panel',
  templateUrl: './admin-store-prep-panel.component.html',
  styleUrls: ['./admin-store-prep-panel.component.scss'],
})
export class AdminStorePrepPanelComponent {
  readonly ui = inject(StoreAdminService);

  @Input({ required: true }) pedido!: Pedido;
  readonly cajas = CAJAS;
  caja = 'Caja M';
  peso = '0.9';
  readonly error = signal('');

  async iniciar(p: Pedido): Promise<void> {
    await this.ui.ejecutar(this.ui.store.iniciarPreparacion(p.no), `${p.no} pasó a preparación.`);
  }

  /** Estante donde se guarda el producto (referencia visual, no es un dato guardado). */
  ubicacion(itemId: string): string {
    const prod = this.ui.store.producto(itemId);
    const base = prod ? ESTANTES[prod.categoria] : 'Estante A';
    return `${base}${(itemId.charCodeAt(0) + itemId.charCodeAt(itemId.length - 1)) % 4 + 1}`;
  }
  marcado(p: Pedido, i: number): boolean { return this.ui.marcado(p.no, i); }
  alternar(p: Pedido, i: number): void { this.ui.alternarPick(p.no, p.items.length, i); }
  completo(p: Pedido): boolean { return this.ui.pickingCompleto(p.no, p.items.length); }

  async empacar(p: Pedido): Promise<void> {
    const kg = parseFloat(this.peso.replace(',', '.'));
    if (!(kg > 0)) {
      this.error.set('El peso debe ser un número mayor que 0.');
      return;
    }
    this.error.set('');
    await this.ui.ejecutar(
      this.ui.store.marcarEmpacado(p.no, `${this.caja} · ${String(kg).replace('.', ',')} kg`),
      `${p.no} quedó empacado.`,
    );
  }
}
