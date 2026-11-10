import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria } from 'src/app/Core/Models/store.models';
import { CATEGORIAS, StoreAdminService } from '../../store-admin.service';

/** Formulario para crear o editar un producto. */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-store-product-sheet',
  templateUrl: './admin-store-product-sheet.component.html',
  styleUrls: ['./admin-store-product-sheet.component.scss'],
})
export class AdminStoreProductSheetComponent implements OnInit {
  readonly ui = inject(StoreAdminService);

  readonly categorias = CATEGORIAS;
  readonly error = signal('');
  form = { id: '', nombre: '', categoria: 'Camisetas' as Categoria, precio: '', stock: '', descripcion: '' };

  ngOnInit(): void {
    const p = this.ui.productoId() ? this.ui.store.producto(this.ui.productoId() as string) : undefined;
    if (p) {
      this.form = { id: p.id, nombre: p.nombre, categoria: p.categoria, precio: String(p.precio), stock: String(p.stock), descripcion: p.descripcion };
    }
  }

  /** En productos con talla el stock se ajusta talla por talla desde Inventario. */
  tieneTallas(): boolean {
    return !!this.ui.store.producto(this.form.id)?.requiereTalla;
  }

  async guardar(): Promise<void> {
    const f = this.form;
    const nombre = f.nombre.trim();
    const precio = parseFloat(f.precio);
    const stock = Number(f.stock);
    const conTalla = this.tieneTallas();
    const error =
      !nombre ? 'Escribe el nombre del producto.'
      : !(precio > 0) ? 'El precio debe ser un número mayor que 0.'
      : !conTalla && !(String(f.stock).trim() !== '' && Number.isInteger(stock) && stock >= 0) ? 'El stock debe ser un número entero desde 0.'
      : '';
    this.error.set(error);
    if (error) return;

    const r = await this.ui.store.guardarProducto({
      id: f.id, nombre, categoria: f.categoria, precio, stock: conTalla ? null : stock, descripcion: f.descripcion.trim(),
    });
    if (!r.ok) { this.error.set(r.error); return; }
    this.ui.cerrarHoja();
    this.ui.mostrarAviso(f.id ? 'Cambios guardados.' : 'Producto creado.');
  }
}
