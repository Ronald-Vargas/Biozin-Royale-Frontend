import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { Resultado, StoreService } from 'src/app/Core/Services/store.service';
import {
  Categoria, Grupo, GRUPOS, GRUPOS_ACTIVOS, StoreNotificacion, grupoDe, totalPedido,
} from 'src/app/Core/Models/store.models';
import { STOCK_BAJO } from './store-admin.utils';

export type Seccion = 'res' | 'log' | 'ord' | 'prods' | 'inv';
export type Hoja = 'pedido' | 'producto';
export interface Dialogo { titulo: string; texto: string; ok: string; conservar: string; accion: () => void; }

export const SECCIONES: { k: Seccion; t: string; nuevo?: boolean }[] = [
  { k: 'res', t: 'Resumen' }, { k: 'log', t: 'Logística', nuevo: true }, { k: 'ord', t: 'Pedidos' },
  { k: 'prods', t: 'Productos' }, { k: 'inv', t: 'Inventario' },
];
export const CATEGORIAS: Categoria[] = ['Camisetas', 'Sudaderas y gorras', 'Accesorios', 'Hogar', 'Juegos'];

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Estado de la pantalla de administración de la tienda (sección abierta, ventanas, filtros) y los
 * datos derivados que usan varias secciones. Lo provee `StoreComponent`, así que vive y muere con la pantalla.
 */
@Injectable()
export class StoreAdminService implements OnDestroy {
  readonly store = inject(StoreService);

  // ── Pantalla y ventanas ──
  readonly seccion = signal<Seccion>('res');
  readonly hoja = signal<Hoja | null>(null);
  readonly pedidoNo = signal<string | null>(null);
  /** Producto que se edita en la hoja; null cuando es uno nuevo. */
  readonly productoId = signal<string | null>(null);
  readonly errorLog = signal('');
  readonly aviso = signal<string | null>(null);
  readonly dialogo = signal<Dialogo | null>(null);
  readonly banner = signal<StoreNotificacion | null>(null);
  /** Artículos ya sacados de bodega, por pedido (hoja de preparación). */
  readonly picks = signal<Record<string, boolean[]>>({});

  // ── Filtros ──
  readonly filtroPedidos = signal<'Todos' | Grupo>('Todos');
  readonly busquedaPed = signal('');
  readonly busquedaProd = signal('');
  readonly soloBajo = signal(false);

  private temporizador?: ReturnType<typeof setTimeout>;
  private temporizadorBanner?: ReturnType<typeof setTimeout>;

  // ── Derivados: pedidos y logística ──
  readonly pedidos = this.store.pedidos;
  readonly grupos = computed(() => GRUPOS_ACTIVOS.map(g => ({ nombre: g, pedidos: this.pedidos().filter(p => grupoDe(p) === g) })));
  readonly cuenta = computed(() => {
    const c: Record<string, number> = {};
    for (const g of GRUPOS) c[g] = this.pedidos().filter(p => grupoDe(p) === g).length;
    return c;
  });
  readonly porAtender = computed(() => this.cuenta()['Por verificar pago'] + this.cuenta()['Por preparar']);
  readonly enPreparacion = computed(() => this.cuenta()['Por preparar'] + this.cuenta()['En preparación']);
  readonly pedidosFiltrados = computed(() => {
    const q = norm(this.busquedaPed().trim());
    return this.pedidos().filter(p =>
      (this.filtroPedidos() === 'Todos' || grupoDe(p) === this.filtroPedidos())
      && (!q || norm(`${p.no} ${p.cliente} ${p.correo}`).includes(q)));
  });
  readonly requierenAccion = computed(() => this.pedidos().filter(p => ['Por verificar pago', 'Por preparar', 'Incidencias'].includes(grupoDe(p))).slice(0, 5));
  readonly ventas = computed(() => this.pedidos().filter(p => !p.cancelado && p.estadoPago === 'confirmado').reduce((a, p) => a + totalPedido(p), 0));
  readonly valoracion = computed(() => {
    const votos = this.pedidos().filter(p => p.calificacion > 0);
    return votos.length ? votos.reduce((a, p) => a + p.calificacion, 0) / votos.length : 0;
  });
  /** Último movimiento de cada pedido, para la bitácora del resumen. */
  readonly movimientos = computed(() => this.pedidos().filter(p => p.eventos.length).map(p => ({ no: p.no, ...p.eventos[p.eventos.length - 1] })).slice(0, 6));
  readonly pedidoAbierto = computed(() => this.pedidos().find(p => p.no === this.pedidoNo()) ?? null);
  readonly noLeidas = computed(() => this.store.notificaciones().filter(n => !n.leida).length);

  // ── Derivados: catálogo e inventario ──
  readonly productosFiltrados = computed(() => {
    const q = norm(this.busquedaProd().trim());
    return q ? this.store.productos().filter(p => norm(`${p.nombre} ${p.categoria}`).includes(q)) : this.store.productos();
  });
  readonly stockBajo = computed(() => this.store.productos().filter(p => p.stock <= STOCK_BAJO));
  readonly inventario = computed(() => (this.soloBajo() ? this.stockBajo() : this.store.productos()));
  readonly unidades = computed(() => this.store.productos().reduce((a, p) => a + p.stock, 0));
  readonly valorInventario = computed(() => this.store.productos().reduce((a, p) => a + p.stock * p.precio, 0));

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
    clearTimeout(this.temporizadorBanner);
  }

  // ── Navegación y ventanas ──
  irSeccion(s: Seccion): void {
    this.seccion.set(s);
    this.cerrarHoja();
  }
  cerrarHoja(): void {
    this.hoja.set(null);
    this.errorLog.set('');
  }
  abrirPedido(no: string): void {
    this.pedidoNo.set(no);
    this.errorLog.set('');
    this.hoja.set('pedido');
  }
  nuevoProducto(): void {
    this.productoId.set(null);
    this.hoja.set('producto');
  }
  editarProducto(id: string): void {
    if (!this.store.producto(id)) return;
    this.productoId.set(id);
    this.hoja.set('producto');
  }

  // ── Avisos y confirmación ──
  mostrarAviso(texto: string): void {
    clearTimeout(this.temporizador);
    this.aviso.set(texto);
    this.temporizador = setTimeout(() => this.aviso.set(null), 3200);
  }
  mostrarBanner(n: StoreNotificacion): void {
    this.banner.set(n);
    clearTimeout(this.temporizadorBanner);
    this.temporizadorBanner = setTimeout(() => this.banner.set(null), 4500);
  }
  /** Abre en Logística el pedido de un aviso y lo marca como leído. */
  abrirAviso(n: StoreNotificacion): void {
    this.store.marcarLeida(n.id);
    this.banner.set(null);
    this.seccion.set('log');
    this.abrirPedido(n.pedidoNo);
  }
  pedirConfirmacion(d: Dialogo): void {
    this.dialogo.set(d);
  }
  aceptarDialogo(): void {
    const d = this.dialogo();
    this.dialogo.set(null);
    d?.accion();
  }
  cancelarDialogo(): void {
    this.dialogo.set(null);
  }

  /** Ejecuta una acción del servidor y muestra el resultado; devuelve true si salió bien. */
  async ejecutar(accion: Promise<Resultado<unknown>>, exito: string): Promise<boolean> {
    const r = await accion;
    if (r.ok) { this.errorLog.set(''); this.mostrarAviso(exito); }
    else this.errorLog.set(r.error);
    return r.ok;
  }

  // ── Hoja de preparación: artículos sacados de bodega ──
  marcado(no: string, i: number): boolean {
    return !!this.picks()[no]?.[i];
  }
  alternarPick(no: string, total: number, i: number): void {
    this.picks.update(m => {
      const actual = [...(m[no] ?? Array.from({ length: total }, () => false))];
      actual[i] = !actual[i];
      return { ...m, [no]: actual };
    });
  }
  pickingCompleto(no: string, total: number): boolean {
    const m = this.picks()[no];
    return !!m && Array.from({ length: total }, (_, i) => i).every(i => m[i]);
  }
}
