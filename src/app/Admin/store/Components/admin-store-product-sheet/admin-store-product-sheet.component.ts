import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria, FORMATOS_IMAGEN_PRODUCTO, TAMANO_MAXIMO_IMAGEN_PRODUCTO } from 'src/app/Core/Models/store.models';
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
  readonly errorImagen = signal('');
  readonly avisoDimension = signal('');
  readonly subiendoImagen = signal(false);
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

  /** Imagen actual del producto que se está editando; vacío si todavía no tiene una. */
  imagenActual(): string {
    return (this.form.id && this.ui.store.producto(this.form.id)?.imagen) || '';
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

    const eraNuevo = !f.id;
    const r = await this.ui.store.guardarProducto({
      id: f.id, nombre, categoria: f.categoria, precio, stock: conTalla ? null : stock, descripcion: f.descripcion.trim(),
    });
    if (!r.ok) { this.error.set(r.error); return; }

    if (eraNuevo) {
      // Ya existe (tiene id): se deja la hoja abierta para poder subirle la foto de inmediato.
      this.form.id = r.valor.id;
      this.ui.mostrarAviso('Producto creado. Ahora puedes subirle una foto.');
    } else {
      this.ui.cerrarHoja();
      this.ui.mostrarAviso('Cambios guardados.');
    }
  }

  async elegirImagen(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    this.errorImagen.set('');
    this.avisoDimension.set('');

    if (!FORMATOS_IMAGEN_PRODUCTO.includes(archivo.type)) {
      this.errorImagen.set('Formato no válido. Usa WebP, JPG o PNG.');
      input.value = '';
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_IMAGEN_PRODUCTO) {
      this.errorImagen.set('La imagen no puede superar 3 MB.');
      input.value = '';
      return;
    }
    if (!(await this.esCuadrada(archivo))) {
      this.avisoDimension.set('La imagen no es cuadrada: se recortará al mostrarse. Para mejor resultado, usa 1000×1000.');
    }

    this.subiendoImagen.set(true);
    const r = await this.ui.store.subirImagenProducto(this.form.id, archivo);
    this.subiendoImagen.set(false);
    input.value = '';
    if (!r.ok) { this.errorImagen.set(r.error); return; }
    this.ui.mostrarAviso('Foto actualizada.');
  }

  /** Si no se puede medir (archivo corrupto, etc.) no bloqueamos con una advertencia falsa. */
  private esCuadrada(archivo: File): Promise<boolean> {
    return new Promise(resolve => {
      const url = URL.createObjectURL(archivo);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img.width === img.height); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(true); };
      img.src = url;
    });
  }
}
