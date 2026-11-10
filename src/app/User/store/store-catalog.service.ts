import { Injectable, computed, inject, signal } from '@angular/core';
import { StoreService } from 'src/app/Core/Services/store.service';
import { Categoria, Producto } from 'src/app/Core/Models/store.models';
import { StoreNavService } from './store-nav.service';

export type Orden = 'rel' | 'lo' | 'hi';
export const CATEGORIAS: Categoria[] = ['Camisetas', 'Sudaderas y gorras', 'Accesorios', 'Hogar', 'Juegos'];

/** Búsqueda, categoría y orden del catálogo, más el producto abierto en el detalle. */
@Injectable()
export class StoreCatalogService {
  private readonly store = inject(StoreService);
  private readonly nav = inject(StoreNavService);

  readonly filtros: ('Todas' | Categoria)[] = ['Todas', ...CATEGORIAS];
  readonly busqueda = signal('');
  readonly categoria = signal<'Todas' | Categoria>('Todas');
  readonly orden = signal<Orden>('rel');

  readonly visibles = computed(() => this.store.productos().filter(p => p.visible));
  readonly novedades = computed(() => this.visibles().filter(p => !!p.etiqueta));
  readonly conteos = computed(() => {
    const m: Record<string, number> = { Todas: this.visibles().length };
    for (const c of CATEGORIAS) m[c] = this.visibles().filter(p => p.categoria === c).length;
    return m;
  });
  readonly filtrados = computed(() => {
    const q = this.busqueda().trim();
    const c = this.categoria();
    let lista = this.visibles().filter(p => (c === 'Todas' || p.categoria === c) && (!q || this.coincide(p, q)));
    if (this.orden() === 'lo') lista = [...lista].sort((a, b) => a.precio - b.precio);
    if (this.orden() === 'hi') lista = [...lista].sort((a, b) => b.precio - a.precio);
    return lista;
  });
  readonly detalle = computed(() => this.store.productos().find(p => p.id === this.nav.productoId()) ?? null);
  readonly relacionados = computed(() => {
    const d = this.detalle();
    if (!d) return [];
    const resto = this.visibles().filter(p => p.id !== d.id);
    return [...resto.filter(p => p.categoria === d.categoria), ...resto.filter(p => p.categoria !== d.categoria)].slice(0, 4);
  });

  verCategoria(c: 'Todas' | Categoria): void {
    this.categoria.set(c);
    this.busqueda.set('');
    if (this.nav.vista() !== 'home') this.nav.ir('home');
  }

  private norm(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  private coincide(p: Producto, q: string): boolean {
    const texto = this.norm(`${p.nombre} ${p.categoria} ${p.descripcion}`);
    return this.norm(q).split(/\s+/).filter(Boolean).every(w => texto.includes(w));
  }
}
