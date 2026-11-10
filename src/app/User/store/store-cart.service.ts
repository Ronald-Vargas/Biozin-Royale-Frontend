import { Injectable, computed, inject, signal } from '@angular/core';
import { StoreService } from 'src/app/Core/Services/store.service';
import { Producto } from 'src/app/Core/Models/store.models';
import { StoreNavService } from './store-nav.service';

export interface LineaCarrito { id: string; talla: string | null; cantidad: number; }

/** Carrito del cliente y sus reglas de stock. Lo provee `StoreComponent`. */
@Injectable()
export class StoreCartService {
  private readonly store = inject(StoreService);
  private readonly nav = inject(StoreNavService);

  readonly carrito = signal<LineaCarrito[]>([]);

  readonly cantidadCarrito = computed(() => this.carrito().reduce((a, l) => a + l.cantidad, 0));
  readonly totales = computed(() => {
    const subtotal = this.carrito().reduce((a, l) => a + this.producto(l.id).precio * l.cantidad, 0);
    const cfg = this.store.config();
    const envio = subtotal > 0 && subtotal < cfg.envioGratisDesde ? cfg.costoEnvio : 0;
    return { subtotal, envio, total: subtotal + envio };
  });

  producto(id: string): Producto {
    return this.store.productos().find(p => p.id === id)
      ?? { id, nombre: 'Producto eliminado', categoria: 'Juegos', precio: 0, arte: 'pin', variante: '', stock: 0, etiqueta: '', descripcion: '', visible: false, requiereTalla: false, tallas: [] };
  }
  nombreDe(id: string): string {
    return this.producto(id).nombre;
  }

  /** Unidades disponibles de un producto; con talla, las de esa talla. */
  stockDe(id: string, talla: string | null): number {
    const p = this.producto(id);
    return talla ? (p.tallas.find(t => t.talla === talla)?.stock ?? 0) : p.stock;
  }

  /** Qué botón mostrar en la tarjeta del producto. */
  accion(p: Producto): 'agotado' | 'talla' | 'cantidad' | 'anadir' {
    if (p.stock <= 0) return 'agotado';
    if (p.requiereTalla) return 'talla';
    return this.cantidadDe(p.id) > 0 ? 'cantidad' : 'anadir';
  }
  indiceDe(id: string): number {
    return this.carrito().findIndex(l => l.id === id && !l.talla);
  }
  cantidadDe(id: string): number {
    const i = this.indiceDe(id);
    return i >= 0 ? this.carrito()[i].cantidad : 0;
  }
  abrirTallas(id: string): void {
    this.nav.hoja.set({ tipo: 'tallas', id });
  }

  anadir(id: string, talla: string | null = null, avisar = false): void {
    const p = this.producto(id);
    const existente = this.carrito().find(l => l.id === id && l.talla === talla);
    if ((existente?.cantidad ?? 0) >= this.stockDe(id, talla)) {
      this.nav.mostrarAviso(`No hay más unidades de ${p.nombre} en inventario.`);
      return;
    }
    this.carrito.update(c => existente
      ? c.map(l => (l === existente ? { ...l, cantidad: l.cantidad + 1 } : l))
      : [...c, { id, talla, cantidad: 1 }]);
    this.nav.hoja.set(null);
    if (avisar) this.nav.mostrarAviso(`${p.nombre} añadido al carrito.`, true);
  }
  cambiar(i: number, delta: number): void {
    const linea = this.carrito()[i];
    const p = this.producto(linea.id);
    if (delta > 0 && linea.cantidad >= this.stockDe(linea.id, linea.talla)) {
      this.nav.mostrarAviso(`No hay más unidades de ${p.nombre} en inventario.`);
      return;
    }
    this.carrito.update(c => c.map((l, k) => (k === i ? { ...l, cantidad: l.cantidad + delta } : l)).filter(l => l.cantidad > 0));
  }
  quitar(i: number): void {
    this.carrito.update(c => c.filter((_, k) => k !== i));
  }
  vaciar(): void {
    this.carrito.set([]);
  }
}
