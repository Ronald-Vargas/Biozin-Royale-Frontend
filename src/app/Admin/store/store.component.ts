import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AdminNavComponent } from 'src/app/Admin/shared/admin-nav/admin-nav.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { StoreDemoService } from 'src/app/Core/Services/store-demo.service';
import {
  Categoria, CORTE_DESPACHO, Grupo, GRUPOS, GRUPOS_ACTIVOS, Pedido, Producto, Rol, StoreNotificacion, TRANSPORTISTAS,
  Transportista, Usuario, cubre, etapaActual, etapasDe, grupoDe, puedeCancelar, subtotalPedido, totalPedido,
} from 'src/app/Core/Models/store.models';

// ───────────────────────── Tipos de la pantalla ─────────────────────────
type Seccion = 'res' | 'log' | 'ord' | 'prods' | 'inv' | 'cli';
type Hoja = 'pedido' | 'cliente' | 'producto';

interface Dialogo { titulo: string; texto: string; ok: string; conservar: string; accion: () => void; }

// ─────────────────── Constantes ───────────────────
const AGENTE = 'Admin Royale'; // quien aparece en la bitácora cuando el admin hace un cambio
const STOCK_BAJO = 5;
const SECCIONES: { k: Seccion; t: string; nuevo?: boolean }[] = [
  { k: 'res', t: 'Resumen' }, { k: 'log', t: 'Logística', nuevo: true }, { k: 'ord', t: 'Pedidos' },
  { k: 'prods', t: 'Productos' }, { k: 'inv', t: 'Inventario' }, { k: 'cli', t: 'Clientes' },
];
const CATEGORIAS: Categoria[] = ['Camisetas', 'Sudaderas y gorras', 'Accesorios', 'Hogar', 'Juegos'];
const CAJAS = ['Caja S', 'Caja M', 'Caja L'];
const MOTIVOS = ['Cliente no contesta', 'Dirección incorrecta', 'Zona de difícil acceso'];
const ESTANTES: Record<Categoria, string> = {
  Camisetas: 'Estante A', 'Sudaderas y gorras': 'Estante B', Accesorios: 'Estante C', Hogar: 'Estante D', Juegos: 'Estante E',
};


// ───────────────────────── Componente ─────────────────────────
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent, AdminHeaderComponent, AdminNavComponent],
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnDestroy {
  private readonly router = inject(Router);
  readonly store = inject(StoreDemoService);

  // Datos fijos para la plantilla
  readonly yo = this.store.adminCorreo;
  readonly corte = CORTE_DESPACHO;
  readonly secciones = SECCIONES;
  readonly categorias = CATEGORIAS;
  readonly cajas = CAJAS;
  readonly motivos = MOTIVOS;
  readonly filtrosPedido: ('Todos' | Grupo)[] = ['Todos', ...GRUPOS];
  readonly estrellas = [1, 2, 3, 4, 5];
  readonly iconBuscar = ICON_SEARCH;

  // Estado de la pantalla
  readonly seccion = signal<Seccion>('res');
  readonly filtroPedidos = signal<'Todos' | Grupo>('Todos');
  readonly busquedaPed = signal('');
  readonly busquedaProd = signal('');
  readonly soloBajo = signal(false);
  readonly hoja = signal<Hoja | null>(null);
  readonly pedidoNo = signal<string | null>(null);
  readonly clienteCorreo = signal<string | null>(null);
  readonly errorForm = signal('');
  readonly errorLog = signal('');
  readonly dialogo = signal<Dialogo | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly banner = signal<StoreNotificacion | null>(null);
  /** Artículos ya sacados de bodega, por pedido (hoja de preparación). */
  readonly picks = signal<Record<string, boolean[]>>({});

  // Formularios de la hoja del pedido
  caja = 'Caja M';
  peso = '0.9';
  transportistaId = '';
  motivo = MOTIVOS[0];
  codigoEntrada = '';

  // Formularios de producto y usuario
  formProd = { id: '', nombre: '', categoria: 'Camisetas' as Categoria, precio: '', stock: '', descripcion: '' };
  formUsr = { nombre: '', correo: '', rol: 'cliente' as Rol, clave: '' };

  private temporizador?: ReturnType<typeof setTimeout>;
  private temporizadorBanner?: ReturnType<typeof setTimeout>;
  private ultimoAviso = Math.max(0, ...this.store.notificaciones().map(n => n.id));

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
    const q = this.norm(this.busquedaPed().trim());
    return this.pedidos().filter(p =>
      (this.filtroPedidos() === 'Todos' || grupoDe(p) === this.filtroPedidos())
      && (!q || this.norm(`${p.no} ${p.cliente} ${p.correo}`).includes(q)));
  });
  readonly requierenAccion = computed(() => this.pedidos().filter(p => ['Por verificar pago', 'Por preparar', 'Incidencias'].includes(grupoDe(p))).slice(0, 5));
  readonly ventas = computed(() => this.pedidos().filter(p => !p.cancelado && p.estadoPago === 'confirmado').reduce((a, p) => a + totalPedido(p), 0));
  readonly costoEnvios = computed(() => this.pedidos().filter(p => !p.cancelado).reduce((a, p) => a + p.envio, 0));
  readonly valoracion = computed(() => {
    const votos = this.pedidos().filter(p => p.calificacion > 0);
    return votos.length ? votos.reduce((a, p) => a + p.calificacion, 0) / votos.length : 0;
  });
  /** Último movimiento de cada pedido, para la bitácora del resumen. */
  readonly movimientos = computed(() => this.pedidos().map(p => ({ no: p.no, ...p.eventos[p.eventos.length - 1] })).slice(0, 6));
  readonly pedidoAbierto = computed(() => this.pedidos().find(p => p.no === this.pedidoNo()) ?? null);
  readonly misAvisos = computed(() => this.store.notificaciones().filter(n => n.correo === this.yo));
  readonly noLeidas = computed(() => this.misAvisos().filter(n => !n.leida).length);

  // ── Derivados: catálogo, inventario, clientes y usuarios ──
  readonly productosFiltrados = computed(() => {
    const q = this.norm(this.busquedaProd().trim());
    return q ? this.store.productos().filter(p => this.norm(`${p.nombre} ${p.categoria}`).includes(q)) : this.store.productos();
  });
  readonly stockBajo = computed(() => this.store.productos().filter(p => p.stock <= STOCK_BAJO));
  readonly inventario = computed(() => (this.soloBajo() ? this.stockBajo() : this.store.productos()));
  readonly unidades = computed(() => this.store.productos().reduce((a, p) => a + p.stock, 0));
  readonly valorInventario = computed(() => this.store.productos().reduce((a, p) => a + p.stock * p.precio, 0));
  readonly clientes = computed(() => this.store.usuarios().filter(u => u.rol === 'cliente').map(u => {
    const propios = this.pedidos().filter(p => p.correo === u.correo);
    const gastado = propios.filter(p => !p.cancelado && p.estadoPago === 'confirmado').reduce((a, p) => a + totalPedido(p), 0);
    return { ...u, cantidad: propios.length, gastado };
  }));
  readonly clienteAbierto = computed(() => this.store.usuarios().find(u => u.correo === this.clienteCorreo()) ?? null);

  constructor() {
    // Aviso emergente cuando llega un pedido nuevo o el cliente hace un cambio.
    effect(() => {
      const nuevo = this.misAvisos().find(n => n.id > this.ultimoAviso && !n.leida);
      if (!nuevo) return;
      this.ultimoAviso = Math.max(...this.misAvisos().map(n => n.id));
      this.banner.set(nuevo);
      clearTimeout(this.temporizadorBanner);
      this.temporizadorBanner = setTimeout(() => this.banner.set(null), 4500);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
    clearTimeout(this.temporizadorBanner);
  }

  // ── Navegación ──
  onBack(): void {
    this.router.navigate(['/admin']);
  }
  irSeccion(s: Seccion): void {
    this.seccion.set(s);
    this.cerrarHoja();
  }
  cerrarHoja(): void {
    this.hoja.set(null);
    this.errorForm.set('');
    this.errorLog.set('');
  }

  // ── Utilidades ──
  private norm(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  dinero(n: number): string {
    return `$${n.toFixed(2)}`;
  }
  mostrarAviso(texto: string): void {
    clearTimeout(this.temporizador);
    this.aviso.set(texto);
    this.temporizador = setTimeout(() => this.aviso.set(null), 3200);
  }
  colorDe(p: Producto): string {
    return p.variante.startsWith('#') ? p.variante : '#1b150a';
  }
  trackId = (_: number, x: { id: string }) => x.id;
  trackNo = (_: number, p: Pedido) => p.no;
  trackCorreo = (_: number, c: { correo: string }) => c.correo;
  trackIdx = (i: number) => i;

  // ── Pedidos: datos para mostrar ──
  total(p: Pedido): number {
    return totalPedido(p);
  }
  subtotal(p: Pedido): number {
    return subtotalPedido(p);
  }
  grupo(p: Pedido): Grupo {
    return grupoDe(p);
  }
  etapa(p: Pedido) {
    return etapaActual(p);
  }
  etapas(p: Pedido) {
    return etapasDe(p);
  }
  claseGrupo(p: Pedido): string {
    const g = grupoDe(p);
    return g === 'Cancelados' || g === 'Incidencias' ? 'rojo' : g === 'Por verificar pago' || g === 'Por preparar' ? 'ambar'
      : g === 'En ruta' ? 'violeta' : g === 'Entregados' ? 'verde' : 'azul';
  }
  textoPago(p: Pedido): string {
    return { pendiente: 'Por verificar', confirmado: 'Confirmado', rechazado: 'Rechazado', reembolsado: 'Reembolsado' }[p.estadoPago];
  }
  metodoTexto(p: Pedido): string {
    return { wallet: 'Billetera', card: 'Tarjeta', sinpe: 'SINPE Móvil' }[p.metodoPago];
  }
  fechaDe(p: Pedido, fase: number): string {
    return p.eventos.find(x => x.fase === fase)?.fecha ?? '';
  }
  ultimoMovimiento(p: Pedido): string {
    return p.eventos[p.eventos.length - 1].fecha;
  }
  pedidosDe(correo: string): Pedido[] {
    return this.pedidos().filter(p => p.correo === correo);
  }
  puedeCancelar(p: Pedido): boolean {
    return puedeCancelar(p, 'admin');
  }
  pagoPendiente(p: Pedido): boolean {
    return !p.cancelado && p.estadoPago === 'pendiente';
  }
  bitacora(p: Pedido) {
    return [...p.eventos].reverse();
  }

  abrirPedido(no: string): void {
    this.pedidoNo.set(no);
    this.caja = 'Caja M';
    this.peso = '0.9';
    this.transportistaId = '';
    this.motivo = MOTIVOS[0];
    this.codigoEntrada = '';
    this.errorLog.set('');
    this.hoja.set('pedido');
  }

  // ── Logística: pago ──
  confirmarPago(p: Pedido): void {
    if (this.store.confirmarPago(p.no, AGENTE)) this.mostrarAviso(`Pago de ${p.no} confirmado.`);
  }
  pedirRechazo(p: Pedido): void {
    this.dialogo.set({
      titulo: `¿Rechazar el pago de ${p.no}?`,
      texto: 'El pedido se cancela, las unidades vuelven al inventario y el cliente recibe un aviso. Esta acción no se puede deshacer.',
      ok: 'Rechazar pago',
      conservar: 'Volver',
      accion: () => {
        this.store.rechazarPago(p.no, AGENTE);
        this.mostrarAviso(`Pago de ${p.no} rechazado.`);
      },
    });
  }

  // ── Logística: preparación y empaque ──
  iniciarPreparacion(p: Pedido): void {
    if (this.store.iniciarPreparacion(p.no, AGENTE)) this.mostrarAviso(`${p.no} pasó a preparación.`);
  }
  ubicacion(itemId: string): string {
    const prod = this.store.producto(itemId);
    const base = prod ? ESTANTES[prod.categoria] : 'Estante A';
    return `${base}${(itemId.charCodeAt(0) + itemId.charCodeAt(itemId.length - 1)) % 4 + 1}`;
  }
  marcado(p: Pedido, i: number): boolean {
    return !!this.picks()[p.no]?.[i];
  }
  alternarPick(p: Pedido, i: number): void {
    this.picks.update(m => {
      const actual = [...(m[p.no] ?? p.items.map(() => false))];
      actual[i] = !actual[i];
      return { ...m, [p.no]: actual };
    });
  }
  pickingCompleto(p: Pedido): boolean {
    const m = this.picks()[p.no];
    return !!m && p.items.every((_, i) => m[i]);
  }
  marcarEmpacado(p: Pedido): void {
    const kg = parseFloat(this.peso.replace(',', '.'));
    if (!(kg > 0)) {
      this.errorLog.set('El peso debe ser un número mayor que 0.');
      return;
    }
    this.errorLog.set('');
    if (this.store.marcarEmpacado(p.no, `${this.caja} · ${String(kg).replace('.', ',')} kg`, AGENTE)) this.mostrarAviso(`${p.no} quedó empacado.`);
  }

  // ── Logística: despacho y reparto ──
  opciones(p: Pedido): { t: Transportista; cubre: boolean }[] {
    return TRANSPORTISTAS.map(t => ({ t, cubre: cubre(t, p.direccion) }));
  }
  elegirTransportista(id: string): void {
    this.transportistaId = id;
    this.errorLog.set('');
  }
  despachar(p: Pedido): void {
    if (!this.transportistaId) {
      this.errorLog.set('Elige un transportista para generar la guía.');
      return;
    }
    this.errorLog.set('');
    if (this.store.despachar(p.no, this.transportistaId, AGENTE)) this.mostrarAviso(`Guía generada para ${p.no}.`);
  }
  marcarListoRetiro(p: Pedido): void {
    if (this.store.marcarListoRetiro(p.no, AGENTE)) this.mostrarAviso(`${p.no} está listo para retirar.`);
  }
  iniciarReparto(p: Pedido): void {
    if (this.store.iniciarReparto(p.no, AGENTE)) this.mostrarAviso(`${p.no} salió a reparto.`);
  }
  registrarIncidencia(p: Pedido): void {
    if (this.store.registrarIncidencia(p.no, this.motivo, AGENTE)) this.mostrarAviso(`Incidencia registrada en ${p.no}.`);
  }
  reprogramarPorCliente(p: Pedido): void {
    const ventana = this.store.ventanasDisponibles()[0];
    if (this.store.reprogramar(p.no, ventana, AGENTE, false)) this.mostrarAviso(`${p.no} reprogramado: ${ventana}.`);
  }
  confirmarEntrega(p: Pedido): void {
    if (this.store.confirmarEntrega(p.no, this.codigoEntrada, AGENTE)) {
      this.errorLog.set('');
      this.codigoEntrada = '';
      this.mostrarAviso(`${p.no} entregado.`);
    } else {
      this.errorLog.set('El código no coincide. Pídele al cliente que lo revise en su app.');
    }
  }
  pedirCancelar(p: Pedido): void {
    this.dialogo.set({
      titulo: `¿Cancelar el pedido ${p.no}?`,
      texto: 'Las unidades volverán al inventario y, si ya estaba pagado, se reembolsa al cliente. Esta acción no se puede deshacer.',
      ok: 'Cancelar pedido',
      conservar: 'Conservar pedido',
      accion: () => {
        this.store.cancelar(p.no, AGENTE, 'admin');
        this.mostrarAviso(`Pedido ${p.no} cancelado.`);
      },
    });
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

  // ── Avisos del admin ──
  abrirAviso(n: StoreNotificacion): void {
    this.store.marcarLeida(n.id);
    this.banner.set(null);
    this.seccion.set('log');
    this.abrirPedido(n.pedidoNo);
  }

  // ── Productos ──
  nuevoProducto(): void {
    this.formProd = { id: '', nombre: '', categoria: 'Camisetas', precio: '', stock: '', descripcion: '' };
    this.errorForm.set('');
    this.hoja.set('producto');
  }
  editarProducto(id: string): void {
    const p = this.store.producto(id);
    if (!p) return;
    this.formProd = { id: p.id, nombre: p.nombre, categoria: p.categoria, precio: String(p.precio), stock: String(p.stock), descripcion: p.descripcion };
    this.errorForm.set('');
    this.hoja.set('producto');
  }
  guardarProducto(): void {
    const f = this.formProd;
    const nombre = f.nombre.trim();
    const precio = parseFloat(f.precio);
    const stock = Number(f.stock);
    const error =
      !nombre ? 'Escribe el nombre del producto.'
      : !(precio > 0) ? 'El precio debe ser un número mayor que 0.'
      : !(String(f.stock).trim() !== '' && Number.isInteger(stock) && stock >= 0) ? 'El stock debe ser un número entero desde 0.'
      : '';
    this.errorForm.set(error);
    if (error) return;

    const descripcion = f.descripcion.trim();
    if (f.id) {
      this.store.productos.update(ps => ps.map(p => (p.id === f.id ? { ...p, nombre, categoria: f.categoria, precio, stock, descripcion } : p)));
    } else {
      const nuevo: Producto = {
        id: `n${Date.now()}`, nombre, categoria: f.categoria, precio, arte: 'pin', variante: '', stock,
        etiqueta: '', descripcion: descripcion || 'Producto oficial de Biozin Royale.', visible: true, requiereTalla: false,
      };
      this.store.productos.update(ps => [...ps, nuevo]);
    }
    this.cerrarHoja();
    this.mostrarAviso(f.id ? 'Cambios guardados.' : 'Producto creado.');
  }
  alternarVisible(id: string): void {
    this.store.productos.update(ps => ps.map(p => (p.id === id ? { ...p, visible: !p.visible } : p)));
  }
  pedirEliminar(p: Producto): void {
    this.dialogo.set({
      titulo: `¿Eliminar ${p.nombre}?`,
      texto: 'El producto desaparecerá de la tienda y del inventario. Los pedidos anteriores conservan su historial. Esta acción no se puede deshacer.',
      ok: 'Eliminar producto',
      conservar: 'Conservar producto',
      accion: () => {
        this.store.productos.update(ps => ps.filter(x => x.id !== p.id));
        this.mostrarAviso('Producto eliminado.');
      },
    });
  }

  // ── Inventario ──
  ajustar(id: string, delta: number): void {
    this.store.productos.update(ps => ps.map(p => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)));
  }
  estadoStock(p: Producto): { texto: string; clase: string } {
    if (p.stock <= 0) return { texto: 'Agotado', clase: 'agotado' };
    if (p.stock <= STOCK_BAJO) return { texto: 'Stock bajo', clase: 'bajo' };
    return { texto: 'Disponible', clase: 'ok' };
  }

  // ── Clientes ──
  abrirCliente(correo: string): void {
    this.clienteCorreo.set(correo);
    this.hoja.set('cliente');
  }


  // ── Diálogo de confirmación ──
  aceptarDialogo(): void {
    const d = this.dialogo();
    this.dialogo.set(null);
    d?.accion();
  }
  cancelarDialogo(): void {
    this.dialogo.set(null);
  }
}