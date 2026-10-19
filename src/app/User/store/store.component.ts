import { Component, ElementRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { BalanceService } from 'src/app/Core/Services/balance.service';

// ───────────────────────── Tipos ─────────────────────────
type Vista = 'home' | 'prod' | 'cart' | 'chk' | 'ok' | 'mine';
type Categoria = 'Camisetas' | 'Sudaderas y gorras' | 'Accesorios' | 'Hogar' | 'Juegos';
type Estado = 'Pendiente' | 'Preparando' | 'Enviado' | 'Entregado' | 'Cancelado';
type Metodo = 'wallet' | 'card' | 'sinpe';
type Orden = 'rel' | 'lo' | 'hi';
type Arte = 'tee' | 'hood' | 'cap' | 'mug' | 'key' | 'pin' | 'tote' | 'post' | 'cards' | 'dice' | 'mat' | 'chips';

interface Producto {
  id: string;
  nombre: string;
  categoria: Categoria;
  precio: number;
  arte: Arte;
  /** Color (hex) de la prenda, o la ficha ('5' | '25' | '100') en llaveros; 'mix' en el set de 100 fichas. */
  variante: string;
  stock: number;
  etiqueta: string;
  descripcion: string;
  visible: boolean;
  requiereTalla: boolean;
}

interface LineaCarrito { id: string; talla: string | null; cantidad: number; }
interface ItemPedido   { id: string; talla: string | null; cantidad: number; precio: number; }
interface Pedido {
  no: string;
  fecha: string;
  estado: Estado;
  pago: string;
  direccion: string;
  items: ItemPedido[];
  historial: { estado: Estado; fecha: string }[];
}

// ─────────────────── Constantes y datos simulados ───────────────────
const CATEGORIAS: Categoria[] = ['Camisetas', 'Sudaderas y gorras', 'Accesorios', 'Hogar', 'Juegos'];
const ESTADOS: Estado[] = ['Pendiente', 'Preparando', 'Enviado', 'Entregado'];
const TALLAS = ['S', 'M', 'L', 'XL'];
const PROVINCIAS = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];
const ENVIO_GRATIS_DESDE = 60;
const COSTO_ENVIO = 5;
const SALDO_DEMO = 891; // se usa solo si BalanceService todavía no devolvió el saldo real

const ICON_RECIBO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>`;
const ICON_CARRITO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11h10.2l2-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>`;

const crear = (
  id: string, nombre: string, categoria: Categoria, precio: number, arte: Arte,
  variante: string, stock: number, etiqueta: string, descripcion: string,
): Producto => ({
  id, nombre, categoria, precio, arte, variante, stock, etiqueta, descripcion,
  visible: true,
  requiereTalla: arte === 'tee' || arte === 'hood',
});

const PRODUCTOS: Producto[] = [
  crear('t1', 'Camiseta Royale', 'Camisetas', 28, 'tee', '#15110a', 24, 'Más vendido', 'Algodón negro con el emblema bordado al pecho.'),
  crear('t2', 'Camiseta Marfil', 'Camisetas', 30, 'tee', '#ece3cb', 6, '', 'Color marfil con el emblema en dorado y negro.'),
  crear('t3', 'Camiseta Ruleta', 'Camisetas', 29, 'tee', '#3a1319', 15, '', 'Vino profundo, inspirada en la mesa de ruleta.'),
  crear('t4', 'Camiseta Mesa Verde', 'Camisetas', 29, 'tee', '#12261f', 11, '', 'Verde fieltro de mesa con el emblema dorado.'),
  crear('t5', 'Camiseta Gold Member', 'Camisetas', 34, 'tee', '#3a2a0d', 9, 'Nuevo', 'Bronce oscuro, corte relajado y emblema grande.'),
  crear('h1', 'Sudadera High Roller', 'Sudaderas y gorras', 62, 'hood', '#15110a', 3, '', 'Felpa gruesa con capucha y emblema bordado.'),
  crear('h2', 'Sudadera Marfil', 'Sudaderas y gorras', 64, 'hood', '#ece3cb', 10, '', 'Felpa color marfil con interior suave.'),
  crear('g1', 'Gorra Royale Negra', 'Sudaderas y gorras', 24, 'cap', '#15110a', 18, '', 'Ajustable, con el emblema bordado al frente.'),
  crear('g2', 'Gorra Royale Marfil', 'Sudaderas y gorras', 24, 'cap', '#ece3cb', 12, '', 'Ajustable, color marfil con emblema dorado.'),
  crear('g3', 'Gorra Vino', 'Sudaderas y gorras', 26, 'cap', '#3a1319', 14, 'Nuevo', 'Edición vino con bordado dorado.'),
  crear('k1', 'Llavero Ficha 5', 'Accesorios', 8, 'key', '5', 2, '', 'Llavero de metal con la ficha de 5 de la casa.'),
  crear('k2', 'Llavero Ficha 25', 'Accesorios', 9, 'key', '25', 22, '', 'Llavero de metal con la ficha de 25.'),
  crear('k3', 'Llavero Ficha 100', 'Accesorios', 11, 'key', '100', 16, 'Nuevo', 'La ficha de 100 en versión llavero.'),
  crear('r3', 'Pin Royale', 'Accesorios', 6, 'pin', '', 30, '', 'Pin esmaltado con el emblema para solapa o gorra.'),
  crear('a1', 'Bolsa de tela', 'Accesorios', 15, 'tote', '#ece3cb', 26, '', 'Algodón grueso con el emblema estampado.'),
  crear('r1', 'Taza Jackpot', 'Hogar', 14, 'mug', '#2b2210', 40, '', 'Cerámica de 330 ml con borde dorado.'),
  crear('r4', 'Taza Marfil', 'Hogar', 14, 'mug', '#ece3cb', 33, '', 'Cerámica de 330 ml color marfil.'),
  crear('p1', 'Póster Royale', 'Hogar', 18, 'post', '#15110a', 20, '', 'Impresión de 40 × 60 cm en papel mate.'),
  crear('p2', 'Póster Marfil', 'Hogar', 18, 'post', '#ece3cb', 17, '', 'Versión marfil, 40 × 60 cm en papel mate.'),
  crear('j1', 'Baraja Royale', 'Juegos', 16, 'cards', '', 12, 'Más vendido', '54 cartas con dorso negro y dorado.'),
  crear('j2', 'Set de 50 fichas', 'Juegos', 39, 'chips', '', 8, '', 'Cincuenta fichas con estuche de aluminio.'),
  crear('j3', 'Set de 100 fichas', 'Juegos', 69, 'chips', 'mix', 5, '', 'Cien fichas de cinco valores en estuche.'),
  crear('j4', 'Dados dorados', 'Juegos', 12, 'dice', '#15110a', 25, '', 'Dos dados de 16 mm con acabado dorado.'),
  crear('j5', 'Tapete de póker', 'Juegos', 45, 'mat', '#12261f', 7, 'Nuevo', 'Fieltro verde de 90 cm con el emblema.'),
];

const PRODUCTO_ELIMINADO: Producto = crear('x', 'Producto eliminado', 'Juegos', 0, 'pin', '', 0, '', '');

const PEDIDOS_DEMO: Pedido[] = [
  {
    no: 'BR-10241', fecha: '13 oct', estado: 'Pendiente', pago: 'Billetera', direccion: 'Limón, Guácimo',
    items: [{ id: 't1', talla: 'M', cantidad: 2, precio: 28 }, { id: 'g1', talla: null, cantidad: 1, precio: 24 }],
    historial: [{ estado: 'Pendiente', fecha: '13 oct' }],
  },
  {
    no: 'BR-10230', fecha: '9 oct', estado: 'Enviado', pago: 'Tarjeta', direccion: 'Limón, Guácimo',
    items: [{ id: 'j2', talla: null, cantidad: 1, precio: 39 }],
    historial: [
      { estado: 'Pendiente', fecha: '9 oct' }, { estado: 'Preparando', fecha: '10 oct' }, { estado: 'Enviado', fecha: '11 oct' },
    ],
  },
  {
    no: 'BR-10215', fecha: '2 oct', estado: 'Entregado', pago: 'Billetera', direccion: 'Limón, Guácimo',
    items: [{ id: 'r1', talla: null, cantidad: 2, precio: 14 }, { id: 'r3', talla: null, cantidad: 1, precio: 6 }],
    historial: [
      { estado: 'Pendiente', fecha: '2 oct' }, { estado: 'Preparando', fecha: '3 oct' },
      { estado: 'Enviado', fecha: '4 oct' }, { estado: 'Entregado', fecha: '7 oct' },
    ],
  },
];

// ───────────────────────── Componente ─────────────────────────
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly balanceSvc = inject(BalanceService);

  // Datos fijos para la plantilla
  readonly categorias = CATEGORIAS;
  readonly filtros: ('Todas' | Categoria)[] = ['Todas', ...CATEGORIAS];
  readonly estados = ESTADOS;
  readonly tallas = TALLAS;
  readonly provincias = PROVINCIAS;
  readonly iconBuscar = ICON_SEARCH;
  readonly iconRecibo = ICON_RECIBO;
  readonly iconCarrito = ICON_CARRITO;

  // Estado de la pantalla
  readonly vista = signal<Vista>('home');
  readonly productoId = signal<string | null>(null);
  readonly busqueda = signal('');
  readonly categoria = signal<'Todas' | Categoria>('Todas');
  readonly orden = signal<Orden>('rel');
  readonly talla = signal('M');
  readonly hojaTallas = signal<string | null>(null);
  readonly aviso = signal<{ texto: string; verCarrito: boolean } | null>(null);
  readonly error = signal('');
  readonly metodo = signal<Metodo>('wallet');

  // Datos simulados (cuando exista la API, se reemplazan por un servicio)
  readonly productos = signal<Producto[]>(PRODUCTOS);
  readonly carrito = signal<LineaCarrito[]>([]);
  readonly pedidos = signal<Pedido[]>(PEDIDOS_DEMO);
  readonly ultimoPedido = signal<Pedido | null>(null);
  private readonly gastado = signal(0);

  // Formulario de pago
  datos = { nombre: '', telefono: '', provincia: 'San José', direccion: '', tarjeta: '', vence: '', cvv: '' };

  private pila: { vista: Vista; id: string | null }[] = [];
  private temporizador?: ReturnType<typeof setTimeout>;

  // ── Derivados ──
  readonly visibles = computed(() => this.productos().filter(p => p.visible));
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
  readonly detalle = computed(() => this.productos().find(p => p.id === this.productoId()) ?? null);
  readonly relacionados = computed(() => {
    const d = this.detalle();
    if (!d) return [];
    const resto = this.visibles().filter(p => p.id !== d.id);
    return [...resto.filter(p => p.categoria === d.categoria), ...resto.filter(p => p.categoria !== d.categoria)].slice(0, 4);
  });
  readonly cantidadCarrito = computed(() => this.carrito().reduce((a, l) => a + l.cantidad, 0));
  readonly totales = computed(() => {
    const subtotal = this.carrito().reduce((a, l) => a + this.producto(l.id).precio * l.cantidad, 0);
    const envio = subtotal > 0 && subtotal < ENVIO_GRATIS_DESDE ? COSTO_ENVIO : 0;
    return { subtotal, envio, total: subtotal + envio };
  });
  readonly saldo = computed(() => (this.balanceSvc.balance() ?? SALDO_DEMO) - this.gastado());
  readonly titulo = computed(() => ({
    home: 'Tienda', prod: 'Detalle', cart: 'Carrito', chk: 'Pago', ok: 'Pedido', mine: 'Mis pedidos',
  }[this.vista()]));
  readonly mostrarIconos = computed(() => this.vista() === 'home' || this.vista() === 'prod');

  ngOnInit(): void {
    this.balanceSvc.load();
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  // ── Navegación interna ──
  ir(vista: Vista, id: string | null = null): void {
    const actual = { vista: this.vista(), id: this.productoId() };
    if (vista === 'home' || vista === 'ok') this.pila = [];
    else if (actual.vista !== vista || actual.id !== id) this.pila.push(actual);
    if (vista === 'prod') { this.productoId.set(id); this.talla.set('M'); }
    this.error.set('');
    this.hojaTallas.set(null);
    this.vista.set(vista);
    this.subir();
  }

  /** Flecha del ScreenShell: dentro de la tienda retrocede; en la portada sale al inicio de la app. */
  onBack(): void {
    const previa = this.pila.pop();
    if (previa) {
      this.productoId.set(previa.id);
      this.error.set('');
      this.vista.set(previa.vista);
      this.subir();
    } else if (this.vista() === 'home') {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.ir('home');
    }
  }

  verCategoria(c: 'Todas' | Categoria): void {
    this.categoria.set(c);
    this.busqueda.set('');
    if (this.vista() !== 'home') this.ir('home');
  }

  irALista(): void {
    this.host.nativeElement.querySelector('#lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Búsqueda ──
  private norm(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  private coincide(p: Producto, q: string): boolean {
    const texto = this.norm(`${p.nombre} ${p.categoria} ${p.descripcion}`);
    return this.norm(q).split(/\s+/).filter(Boolean).every(w => texto.includes(w));
  }

  // ── Carrito ──
  producto(id: string): Producto {
    return this.productos().find(p => p.id === id) ?? PRODUCTO_ELIMINADO;
  }
  nombreDe(id: string): string {
    return this.producto(id).nombre;
  }
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
    this.hojaTallas.set(id);
  }
  anadir(id: string, talla: string | null = null, avisar = false): void {
    const p = this.producto(id);
    const existente = this.carrito().find(l => l.id === id && l.talla === talla);
    if ((existente?.cantidad ?? 0) >= p.stock) {
      this.mostrarAviso(`No hay más unidades de ${p.nombre} en inventario.`);
      return;
    }
    this.carrito.update(c => existente
      ? c.map(l => (l === existente ? { ...l, cantidad: l.cantidad + 1 } : l))
      : [...c, { id, talla, cantidad: 1 }]);
    this.hojaTallas.set(null);
    if (avisar) this.mostrarAviso(`${p.nombre} añadido al carrito.`, true);
  }
  cambiar(i: number, delta: number): void {
    const linea = this.carrito()[i];
    const p = this.producto(linea.id);
    if (delta > 0 && linea.cantidad >= p.stock) {
      this.mostrarAviso(`No hay más unidades de ${p.nombre} en inventario.`);
      return;
    }
    this.carrito.update(c => c.map((l, k) => (k === i ? { ...l, cantidad: l.cantidad + delta } : l)).filter(l => l.cantidad > 0));
  }
  quitar(i: number): void {
    this.carrito.update(c => c.filter((_, k) => k !== i));
  }
  mostrarAviso(texto: string, verCarrito = false): void {
    clearTimeout(this.temporizador);
    this.aviso.set({ texto, verCarrito });
    this.temporizador = setTimeout(() => this.aviso.set(null), 3200);
  }

  // ── Pago ──
  setMetodo(m: Metodo): void {
    this.metodo.set(m);
    this.error.set('');
  }

  confirmar(): void {
    const d = this.datos;
    const m = this.metodo();
    const t = this.totales();
    const tarjeta = d.tarjeta.replace(/\s/g, '');
    const sinStock = this.carrito().find(l => l.cantidad > this.producto(l.id).stock);

    const error =
      !d.nombre.trim() ? 'Escribe el nombre de quien recibe.'
      : !/^\d{8}$/.test(d.telefono.replace(/[\s-]/g, '')) ? 'El teléfono debe tener 8 dígitos.'
      : d.direccion.trim().length < 8 ? 'Escribe una dirección exacta para el envío.'
      : m === 'card' && !/^\d{16}$/.test(tarjeta) ? 'El número de tarjeta debe tener 16 dígitos.'
      : m === 'card' && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(d.vence) ? 'La fecha de vencimiento va como MM/AA.'
      : m === 'card' && !/^\d{3,4}$/.test(d.cvv) ? 'El CVV debe tener 3 o 4 dígitos.'
      : sinStock ? `Ya no hay suficiente stock de ${this.nombreDe(sinStock.id)}. Reduce la cantidad en el carrito.`
      : m === 'wallet' && t.total > this.saldo()
        ? `Tu saldo es ${this.dinero(this.saldo())} y el pedido cuesta ${this.dinero(t.total)}. Recarga tu billetera o elige otro método.`
      : '';
    this.error.set(error);
    if (error) return;

    const hoy = new Date().toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }).replace('.', '');
    const pedido: Pedido = {
      no: `BR-${10242 + this.pedidos().length}`,
      fecha: hoy,
      estado: 'Pendiente',
      pago: m === 'wallet' ? 'Billetera' : m === 'card' ? 'Tarjeta' : 'SINPE Móvil',
      direccion: `${d.provincia}, ${d.direccion.trim()}`,
      items: this.carrito().map(l => ({ id: l.id, talla: l.talla, cantidad: l.cantidad, precio: this.producto(l.id).precio })),
      historial: [{ estado: 'Pendiente', fecha: hoy }],
    };

    // Simulación: descuenta stock y saldo en memoria. Aquí va la llamada real a la API.
    this.productos.update(ps => ps.map(p => {
      const vendidas = pedido.items.filter(i => i.id === p.id).reduce((a, i) => a + i.cantidad, 0);
      return vendidas ? { ...p, stock: p.stock - vendidas } : p;
    }));
    if (m === 'wallet') this.gastado.update(g => g + t.total);
    this.pedidos.update(ps => [pedido, ...ps]);
    this.ultimoPedido.set(pedido);
    this.carrito.set([]);
    this.ir('ok');
  }

  // ── Pedidos ──
  totalPedido(p: Pedido): number {
    const s = p.items.reduce((a, i) => a + i.precio * i.cantidad, 0);
    return s + (s > 0 && s < ENVIO_GRATIS_DESDE ? COSTO_ENVIO : 0);
  }
  indiceEstado(e: Estado): number {
    return ESTADOS.indexOf(e);
  }
  fechaDe(p: Pedido, e: Estado): string {
    return p.historial.find(h => h.estado === e)?.fecha ?? '';
  }
  provinciaDe(p: Pedido): string {
    return p.direccion.split(',')[0];
  }

  // ── Utilidades ──
  dinero(n: number): string {
    return `$${n.toFixed(2)}`;
  }
  trackId = (_: number, p: { id: string }) => p.id;
  trackIdx = (i: number) => i;

  private subir(): void {
    setTimeout(() => this.host.nativeElement.querySelector('.shell-body')?.scrollTo({ top: 0 }));
  }
}