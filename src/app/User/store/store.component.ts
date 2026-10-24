import { Component, ElementRef, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { StoreDemoService } from 'src/app/Core/Services/store-demo.service';
import {
  Categoria, COSTO_ENVIO, ENVIO_GRATIS_DESDE, Entrega, Metodo, Pedido, PROVINCIAS, Producto, StoreNotificacion,
  etapaActual, etapasDe, puedeCancelar, subtotalPedido, totalPedido,
} from 'src/app/Core/Models/store.models';

// ───────────────────────── Tipos de la pantalla ─────────────────────────
type Vista = 'home' | 'prod' | 'cart' | 'chk' | 'ok' | 'mine' | 'track';
type Orden = 'rel' | 'lo' | 'hi';
type Hoja = { tipo: 'tallas' | 'direccion' | 'fecha'; id?: string };

interface LineaCarrito { id: string; talla: string | null; cantidad: number; }
interface ItemLinea { titulo: string; detalle: string; clase: 'on' | 'now' | 'off' | 'warn'; }
interface Dialogo { titulo: string; texto: string; ok: string; conservar: string; accion: () => void; }
interface Posicion { vista: Vista; producto: string | null; pedido: string | null; }

// Cliente que está usando la app. Cuando se conecte la sesión real, sale del AuthService.
const CLIENTE = { nombre: 'Ana Mora', correo: 'cliente@biozin.com', telefono: '88887777' };
const SALDO_DEMO = 891; // se usa solo si BalanceService todavía no devolvió el saldo real
const CATEGORIAS: Categoria[] = ['Camisetas', 'Sudaderas y gorras', 'Accesorios', 'Hogar', 'Juegos'];
const TALLAS = ['S', 'M', 'L', 'XL'];
const TITULOS: Record<Vista, string> = {
  home: 'Tienda', prod: 'Detalle', cart: 'Carrito', chk: 'Pago', ok: 'Pedido', mine: 'Mis pedidos', track: 'Seguimiento',
};

const ICON_RECIBO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>`;
const ICON_CARRITO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11h10.2l2-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>`;

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
  readonly store = inject(StoreDemoService);

  // Datos fijos para la plantilla
  readonly cliente = CLIENTE;
  readonly categorias = CATEGORIAS;
  readonly filtros: ('Todas' | Categoria)[] = ['Todas', ...CATEGORIAS];
  readonly tallas = TALLAS;
  readonly provincias = PROVINCIAS;
  readonly estrellas = [1, 2, 3, 4, 5];
  readonly iconBuscar = ICON_SEARCH;
  readonly iconRecibo = ICON_RECIBO;
  readonly iconCarrito = ICON_CARRITO;
  readonly envioGratisDesde = ENVIO_GRATIS_DESDE;

  // Estado de la pantalla
  readonly vista = signal<Vista>('home');
  readonly productoId = signal<string | null>(null);
  readonly pedidoNo = signal<string | null>(null);
  readonly busqueda = signal('');
  readonly categoria = signal<'Todas' | Categoria>('Todas');
  readonly orden = signal<Orden>('rel');
  readonly talla = signal('M');
  readonly hoja = signal<Hoja | null>(null);
  readonly dialogo = signal<Dialogo | null>(null);
  readonly aviso = signal<{ texto: string; verCarrito: boolean } | null>(null);
  readonly banner = signal<StoreNotificacion | null>(null);
  readonly error = signal('');
  readonly metodo = signal<Metodo>('wallet');
  readonly entrega = signal<Entrega>('domicilio');
  readonly carrito = signal<LineaCarrito[]>([]);

  // Formularios
  datos = { nombre: CLIENTE.nombre, telefono: CLIENTE.telefono, provincia: 'Limón', direccion: '', tarjeta: '', vence: '', cvv: '' };
  nuevaDireccion = '';

  private pila: Posicion[] = [];
  private temporizador?: ReturnType<typeof setTimeout>;
  private temporizadorBanner?: ReturnType<typeof setTimeout>;
  private ultimoAviso = Math.max(0, ...this.store.notificaciones().map(n => n.id));

  // ── Derivados: catálogo ──
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
  readonly detalle = computed(() => this.store.productos().find(p => p.id === this.productoId()) ?? null);
  readonly relacionados = computed(() => {
    const d = this.detalle();
    if (!d) return [];
    const resto = this.visibles().filter(p => p.id !== d.id);
    return [...resto.filter(p => p.categoria === d.categoria), ...resto.filter(p => p.categoria !== d.categoria)].slice(0, 4);
  });

  // ── Derivados: carrito, saldo y pedidos ──
  readonly cantidadCarrito = computed(() => this.carrito().reduce((a, l) => a + l.cantidad, 0));
  readonly totales = computed(() => {
    const subtotal = this.carrito().reduce((a, l) => a + this.producto(l.id).precio * l.cantidad, 0);
    const envio = this.entrega() === 'domicilio' && subtotal > 0 && subtotal < ENVIO_GRATIS_DESDE ? COSTO_ENVIO : 0;
    return { subtotal, envio, total: subtotal + envio };
  });
  readonly saldo = computed(() => (this.balanceSvc.balance() ?? SALDO_DEMO) - this.store.gastadoBilletera());
  readonly misPedidos = computed(() => this.store.pedidos().filter(p => p.correo === CLIENTE.correo));
  readonly pedidoActual = computed(() => this.store.pedidos().find(p => p.no === this.pedidoNo()) ?? null);
  readonly avisos = computed(() => this.store.notificaciones().filter(n => n.correo === CLIENTE.correo));
  readonly noLeidas = computed(() => this.avisos().filter(n => !n.leida).length);
  readonly titulo = computed(() => TITULOS[this.vista()]);
  readonly mostrarIconos = computed(() => this.vista() === 'home' || this.vista() === 'prod' || this.vista() === 'mine');

  constructor() {
    // Aviso emergente cuando llega una notificación nueva (por ejemplo, cuando el admin cambia el estado).
    effect(() => {
      const nuevo = this.avisos().find(n => n.id > this.ultimoAviso && !n.leida);
      if (!nuevo) return;
      this.ultimoAviso = Math.max(...this.avisos().map(n => n.id));
      this.banner.set(nuevo);
      clearTimeout(this.temporizadorBanner);
      this.temporizadorBanner = setTimeout(() => this.banner.set(null), 4500);
    });
  }

  ngOnInit(): void {
    this.balanceSvc.load();
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
    clearTimeout(this.temporizadorBanner);
  }

  // ── Navegación interna ──
  ir(vista: Vista, id: string | null = null): void {
    const actual: Posicion = { vista: this.vista(), producto: this.productoId(), pedido: this.pedidoNo() };
    if (vista === 'home' || vista === 'ok') this.pila = [];
    else if (actual.vista !== vista || (vista === 'prod' && actual.producto !== id) || (vista === 'track' && actual.pedido !== id)) this.pila.push(actual);
    if (vista === 'prod') { this.productoId.set(id); this.talla.set('M'); }
    if (vista === 'track') this.pedidoNo.set(id);
    this.error.set('');
    this.hoja.set(null);
    this.vista.set(vista);
    this.subir();
  }

  /** Flecha del ScreenShell: dentro de la tienda retrocede; en la portada sale al inicio de la app. */
  onBack(): void {
    const previa = this.pila.pop();
    if (previa) {
      this.productoId.set(previa.producto);
      this.pedidoNo.set(previa.pedido);
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
    return this.store.productos().find(p => p.id === id)
      ?? { id, nombre: 'Producto eliminado', categoria: 'Juegos', precio: 0, arte: 'pin', variante: '', stock: 0, etiqueta: '', descripcion: '', visible: false, requiereTalla: false };
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
    this.hoja.set({ tipo: 'tallas', id });
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
    this.hoja.set(null);
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
  setEntrega(e: Entrega): void {
    this.entrega.set(e);
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
      : this.entrega() === 'domicilio' && d.direccion.trim().length < 8 ? 'Escribe una dirección exacta para el envío.'
      : m === 'card' && !/^\d{16}$/.test(tarjeta) ? 'El número de tarjeta debe tener 16 dígitos.'
      : m === 'card' && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(d.vence) ? 'La fecha de vencimiento va como MM/AA.'
      : m === 'card' && !/^\d{3,4}$/.test(d.cvv) ? 'El CVV debe tener 3 o 4 dígitos.'
      : sinStock ? `Ya no hay suficiente stock de ${this.nombreDe(sinStock.id)}. Reduce la cantidad en el carrito.`
      : m === 'wallet' && t.total > this.saldo()
        ? `Tu saldo es ${this.dinero(this.saldo())} y el pedido cuesta ${this.dinero(t.total)}. Recarga tu billetera o elige otro método.`
      : '';
    this.error.set(error);
    if (error) return;

    const pedido = this.store.crearPedido({
      correo: CLIENTE.correo,
      cliente: d.nombre.trim(),
      telefono: d.telefono.replace(/[\s-]/g, ''),
      metodoPago: m,
      entrega: this.entrega(),
      direccion: `${d.provincia}, ${d.direccion.trim()}`,
      items: this.carrito().map(l => ({ id: l.id, talla: l.talla, cantidad: l.cantidad })),
      envio: t.envio,
    });
    this.carrito.set([]);
    this.pedidoNo.set(pedido.no);
    this.ir('ok');
  }

  // ── Seguimiento ──
  verPedido(no: string): void {
    this.ir('track', no);
  }
  etapa(p: Pedido) {
    return etapaActual(p);
  }
  totalDe(p: Pedido): number {
    return totalPedido(p);
  }
  subtotalDe(p: Pedido): number {
    return subtotalPedido(p);
  }
  provinciaDe(p: Pedido): string {
    return p.direccion.split(',')[0];
  }
  fechaDe(p: Pedido, fase: number): string {
    return p.eventos.find(x => x.fase === fase)?.fecha ?? '';
  }
  textoPago(p: Pedido): string {
    return { pendiente: 'Por verificar', confirmado: 'Confirmado', rechazado: 'Rechazado', reembolsado: 'Reembolsado' }[p.estadoPago];
  }
  metodoTexto(p: Pedido): string {
    return { wallet: 'Billetera', card: 'Tarjeta', sinpe: 'SINPE Móvil' }[p.metodoPago];
  }
  /** Cuando el pedido está en reparto, el cliente ve su código de entrega; en retiro, su código de retiro. */
  muestraCodigo(p: Pedido): boolean {
    if (p.cancelado || p.incidenciaAbierta) return false;
    return (p.entrega === 'domicilio' && p.fase === 5) || (p.entrega === 'retiro' && p.fase === 4);
  }
  puedeCancelar(p: Pedido): boolean {
    return puedeCancelar(p, 'cliente');
  }
  puedeCambiarDireccion(p: Pedido): boolean {
    return !p.cancelado && p.fase <= 2 && p.entrega === 'domicilio';
  }

  /** Línea de tiempo con fecha y hora de cada hito, más las incidencias y reprogramaciones. */
  lineaTiempo(p: Pedido): ItemLinea[] {
    const salida: ItemLinea[] = [];
    for (const e of etapasDe(p)) {
      const alcanzada = e.fase <= p.fase && (!p.cancelado || e.fase === 0 || p.eventos.some(x => x.fase === e.fase));
      const evento = p.eventos.find(x => x.fase === e.fase && (x.tipo === 'fase' || x.tipo === 'pago'));
      const actual = alcanzada && e.fase === p.fase && !p.cancelado;
      salida.push({
        titulo: e.nombre,
        detalle: alcanzada && evento ? `${evento.fecha} · ${e.texto}` : e.texto,
        clase: actual ? 'now' : alcanzada ? 'on' : 'off',
      });
      if (e.fase === 5 || (p.entrega === 'retiro' && e.fase === 4)) {
        for (const x of p.eventos.filter(v => v.tipo === 'incidencia' || v.tipo === 'reprogramacion')) {
          salida.push({
            titulo: x.tipo === 'incidencia' ? 'Intento fallido' : 'Entrega reprogramada',
            detalle: `${x.fecha} · ${x.texto.split(' · ').slice(1).join(' · ') || x.texto}`,
            clase: x.tipo === 'incidencia' ? 'warn' : 'on',
          });
        }
      }
    }
    const cancelacion = p.eventos.find(x => x.tipo === 'cancelacion');
    if (cancelacion) salida.push({ titulo: 'Pedido cancelado', detalle: `${cancelacion.fecha} · ${cancelacion.texto}`, clase: 'warn' });
    return salida;
  }

  // ── Acciones del cliente sobre su pedido ──
  pedirCancelar(p: Pedido): void {
    this.dialogo.set({
      titulo: `¿Cancelar el pedido ${p.no}?`,
      texto: p.estadoPago === 'confirmado'
        ? 'Te devolvemos tu pago y las unidades vuelven al inventario. Esta acción no se puede deshacer.'
        : 'Las unidades vuelven al inventario. Esta acción no se puede deshacer.',
      ok: 'Cancelar pedido',
      conservar: 'Conservar pedido',
      accion: () => {
        this.store.cancelar(p.no, CLIENTE.nombre, 'cliente');
        this.mostrarAviso(`Pedido ${p.no} cancelado.`);
      },
    });
  }
  abrirDireccion(p: Pedido): void {
    this.nuevaDireccion = p.direccion;
    this.error.set('');
    this.hoja.set({ tipo: 'direccion', id: p.no });
  }
  guardarDireccion(): void {
    const h = this.hoja();
    if (!h?.id) return;
    if (this.nuevaDireccion.trim().length < 8) {
      this.error.set('Escribe una dirección exacta para el envío.');
      return;
    }
    this.error.set('');
    this.store.cambiarDireccion(h.id, this.nuevaDireccion.trim(), CLIENTE.nombre);
    this.hoja.set(null);
    this.mostrarAviso('Dirección actualizada.');
  }
  abrirFechas(p: Pedido): void {
    this.hoja.set({ tipo: 'fecha', id: p.no });
  }
  elegirVentana(ventana: string): void {
    const h = this.hoja();
    if (!h?.id) return;
    this.store.reprogramar(h.id, ventana, CLIENTE.nombre, true);
    this.hoja.set(null);
    this.mostrarAviso('Entrega reprogramada.');
  }
  calificar(p: Pedido, estrellas: number): void {
    if (this.store.calificar(p.no, estrellas, CLIENTE.nombre)) this.mostrarAviso('Gracias por calificar tu entrega.');
  }
  pedirCambio(p: Pedido): void {
    if (this.store.solicitarCambio(p.no, CLIENTE.nombre)) this.mostrarAviso('Recibimos tu solicitud de cambio.');
  }

  // ── Avisos ──
  abrirAviso(n: StoreNotificacion): void {
    this.store.marcarLeida(n.id);
    this.banner.set(null);
    this.ir('track', n.pedidoNo);
  }
  marcarTodas(): void {
    this.store.marcarTodasLeidas(CLIENTE.correo);
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

  // ── Utilidades ──
  dinero(n: number): string {
    return `$${n.toFixed(2)}`;
  }
  trackId = (_: number, p: { id: string }) => p.id;
  trackIdx = (i: number) => i;
  trackNo = (_: number, p: Pedido) => p.no;

  private subir(): void {
    setTimeout(() => this.host.nativeElement.querySelector('.shell-body')?.scrollTo({ top: 0 }));
  }
}