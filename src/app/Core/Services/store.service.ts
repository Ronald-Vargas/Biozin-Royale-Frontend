import { Injectable, NgZone, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { NotificationRealtimeService } from './notification-realtime.service';
import {
  Arte, Categoria, CORTE_DESPACHO, COSTO_ENVIO, ENVIO_GRATIS_DESDE, Evento, EstadoPago, NuevoPedido, Pedido,
  Producto, StoreNotificacion, TipoEvento,
} from '../Models/store.models';

// ───────────── Forma de las respuestas de la API (api/tienda) ─────────────
interface ApiVariante { id: string; size: string | null; stock: number; }
interface ApiProducto {
  id: string; name: string; category: string; description: string; price: number;
  artType: string | null; artVariant: string | null; badge: string; imagePath: string | null;
  requiresSize: boolean; isVisible: boolean; stock: number; variants: ApiVariante[];
}

/** Base pública del bucket de fotos de producto (mismo esquema que los avatares). */
const BUCKET_PRODUCTOS = `${environment.supabaseUrl}/storage/v1/object/public/store-products/`;
interface ApiEvento { id: string; type: string; phase: number | null; message: string; actorName: string; actorRole: string; createdAt: string; }
interface ApiPedido {
  id: string; orderNumber: number; userId: string; customerName: string; email: string; phone: string;
  province: string; canton: string | null; district: string | null; addressLine: string;
  shippingCost: number; paymentMethod: string; paymentStatus: string;
  cardLastFour: string | null; cardNetwork: string | null;
  fulfillmentPhase: number; isCancelled: boolean;
  carrierName: string | null; trackingNumber: string | null; packageInfo: string | null; deliveryCode: string | null;
  hasOpenIncident: boolean; rescheduleWindow: string | null; etaFrom: string | null; etaTo: string | null;
  rating: number | null; createdAt: string;
  items: { productId: string; name: string; size: string | null; quantity: number; unitPrice: number }[];
  events: ApiEvento[];
}
interface ApiAviso { id: string; title: string; body: string; orderId: string | null; read: boolean; createdAt: string; }
interface ApiConfig { freeShippingFrom: number; shippingCost: number; dispatchCutoff: string; returnWindowDays: number; }

/** Resultado de una operación: el componente decide qué mostrar. */
export type Resultado<T = void> = { ok: true; valor: T } | { ok: false; error: string };

const TIPO_EVENTO: Record<string, TipoEvento> = {
  phase: 'fase', payment: 'pago', incident: 'incidencia', reschedule: 'reprogramacion',
  cancellation: 'cancelacion', change: 'cambio', rating: 'calificacion',
};
const ESTADO_PAGO: Record<string, EstadoPago> = {
  pending: 'pendiente', confirmed: 'confirmado', rejected: 'rechazado', refunded: 'reembolsado',
};
const REDES: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex' };
const LEIDOS_ADMIN = 'store_admin_avisos_leidos';

// ───────────── Utilidades de fecha ─────────────
export function fechaHora(iso: string): string {
  const d = new Date(iso);
  const dia = d.toLocaleDateString('es-CR', { weekday: 'short' }).replace('.', '');
  const fecha = d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }).replace('.', '');
  const hora = d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dia} ${fecha} · ${hora}`;
}
function corto(d: Date, conMes: boolean): string {
  const dia = d.toLocaleDateString('es-CR', { weekday: 'short' }).replace('.', '');
  const mes = d.toLocaleDateString('es-CR', { month: 'short' }).replace('.', '');
  return `${dia} ${d.getDate()}${conMes ? ' ' + mes : ''}`;
}
/** "2026-10-20" → fecha local (sin desfase por zona horaria). */
function soloFecha(s: string): Date {
  const [a, m, d] = s.split('-').map(Number);
  return new Date(a, m - 1, d);
}
function rango(desde: string | null, hasta: string | null): string {
  if (!desde || !hasta) return '';
  const a = soloFecha(desde);
  const b = soloFecha(hasta);
  return `${corto(a, a.getMonth() !== b.getMonth())} – ${corto(b, true)}`;
}
function sumarHabiles(n: number): Date {
  const d = new Date();
  let k = 0;
  while (k < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) k++;
  }
  return d;
}
function dinero(n: number): string {
  return `$${n.toFixed(2)}`;
}

/**
 * Tienda conectada al backend (api/tienda). Mantiene los mismos signals que usaba el servicio demo
 * (productos, pedidos, notificaciones) para que las pantallas casi no cambien; las acciones ahora son
 * asíncronas y devuelven un `Resultado`.
 */
@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);
  private readonly realtime = inject(NotificationRealtimeService);
  private readonly zone = inject(NgZone);
  private readonly base = `${environment.apiUrl}/tienda`;

  readonly productos = signal<Producto[]>([]);
  readonly pedidos = signal<Pedido[]>([]);
  readonly config = signal({ envioGratisDesde: ENVIO_GRATIS_DESDE, costoEnvio: COSTO_ENVIO, corte: CORTE_DESPACHO });
  /** true cuando ya llegó la primera respuesta de pedidos (evita avisar por pedidos viejos). */
  readonly cargado = signal(false);
  readonly cargando = signal(false);

  private readonly avisosCliente = signal<StoreNotificacion[]>([]);
  private readonly leidosAdmin = signal<Set<string>>(this.leerLeidos());
  private suscripcion?: Subscription;
  private sondeo?: ReturnType<typeof setInterval>;
  private esAdmin = false;

  /** Avisos del usuario. En el admin salen de lo que hacen los clientes en los pedidos (no se guardan). */
  readonly notificaciones = computed<StoreNotificacion[]>(() =>
    this.esAdmin ? this.avisosAdmin() : this.avisosCliente());

  private readonly avisosAdmin = computed<StoreNotificacion[]>(() => {
    const leidos = this.leidosAdmin();
    const lista: StoreNotificacion[] = [];
    for (const p of this.pedidos()) {
      for (const e of p.eventos) {
        if (!e.id || e.rol === 'admin' || e.rol === 'system') continue;
        let titulo = '';
        let texto = '';
        if (e.tipo === 'fase' && e.fase === 0) {
          titulo = `Nuevo pedido ${p.no}`;
          texto = `${p.cliente} · ${dinero(p.items.reduce((a, i) => a + i.precio * i.cantidad, 0) + p.envio)} · ${p.metodoPago === 'wallet' ? 'Billetera' : 'Tarjeta'}${p.estadoPago === 'pendiente' ? ' por confirmar' : ''}`;
        } else if (e.tipo === 'reprogramacion') {
          titulo = `Entrega reprogramada ${p.no}`;
          texto = `${p.cliente} eligió ${e.texto.split(' · ').slice(1).join(' · ')}`;
        } else if (e.tipo === 'cambio' && e.texto.startsWith('Dirección')) {
          titulo = `Dirección cambiada ${p.no}`;
          texto = `${p.cliente} actualizó la dirección de envío.`;
        } else if (e.tipo === 'cambio') {
          titulo = `Cambio solicitado ${p.no}`;
          texto = `${p.cliente} pidió un cambio o devolución.`;
        } else if (e.tipo === 'cancelacion') {
          titulo = `Pedido cancelado ${p.no}`;
          texto = `${p.cliente} canceló su pedido.`;
        } else continue;
        lista.push({ id: e.id, titulo, texto, fecha: e.fecha, ts: e.ts ?? 0, leida: leidos.has(e.id), pedidoNo: p.no });
      }
    }
    return lista.sort((a, b) => b.ts - a.ts).slice(0, 50);
  });

  producto(id: string): Producto | undefined {
    return this.productos().find(p => p.id === id);
  }
  pedido(no: string): Pedido | undefined {
    return this.pedidos().find(p => p.no === no);
  }

  /** Próximas ventanas de entrega que el cliente puede elegir al reprogramar. */
  ventanasDisponibles(): string[] {
    const a = sumarHabiles(1);
    const b = sumarHabiles(2);
    return [`${corto(a, true)}, 9:00 a 12:00`, `${corto(a, true)}, 1:00 a 5:00`, `${corto(b, true)}, 9:00 a 12:00`];
  }

  // ═════════════ Carga y tiempo real ═════════════

  /** Carga todo lo que necesita la pantalla y se queda escuchando cambios de pedidos. */
  async iniciar(admin: boolean): Promise<void> {
    this.esAdmin = admin;
    this.cargando.set(true);
    await Promise.all([this.cargarConfig(), this.cargarProductos(), this.cargarPedidos()]);
    if (!admin) await this.cargarAvisos();
    else if (this.sinHistorialDeLeidos()) this.marcarTodasLeidas();   // primera vez en este navegador
    this.cargando.set(false);
    this.cargado.set(true);

    this.detener();
    this.suscripcion = this.realtime.pedidoTienda$.subscribe(() => void this.refrescarPedidos());
    // Respaldo por si la conexión en tiempo real no está disponible. Fuera de la zona de Angular:
    // un intervalo dentro de ella mantendría la app como "inestable" para siempre.
    this.zone.runOutsideAngular(() => {
      this.sondeo = setInterval(() => this.zone.run(() => void this.refrescarPedidos()), 45000);
    });
  }

  detener(): void {
    this.suscripcion?.unsubscribe();
    this.suscripcion = undefined;
    clearInterval(this.sondeo);
    this.sondeo = undefined;
  }

  private async refrescarPedidos(): Promise<void> {
    await this.cargarPedidos();
    if (!this.esAdmin) await this.cargarAvisos();
  }

  async cargarConfig(): Promise<void> {
    const r = await this.llamar(this.http.get<ApiResponse<ApiConfig>>(`${this.base}/config`));
    if (!r.ok) return;
    this.config.set({
      envioGratisDesde: r.valor.freeShippingFrom,
      costoEnvio: r.valor.shippingCost,
      corte: this.horaTexto(r.valor.dispatchCutoff),
    });
  }

  async cargarProductos(): Promise<void> {
    const r = await this.llamar(this.http.get<ApiResponse<ApiProducto[]>>(`${this.base}/productos`));
    if (r.ok) this.productos.set(r.valor.map(p => this.aProducto(p)));
  }

  async cargarPedidos(): Promise<void> {
    const url = this.esAdmin ? `${this.base}/admin/pedidos` : `${this.base}/pedidos/mios`;
    const r = await this.llamar(this.http.get<ApiResponse<ApiPedido[]>>(url));
    if (r.ok) this.pedidos.set(r.valor.map(p => this.aPedido(p)));
  }

  async cargarAvisos(): Promise<void> {
    const r = await this.llamar(this.http.get<ApiResponse<ApiAviso[]>>(`${this.base}/notificaciones`));
    if (!r.ok) return;
    const noPorId = new Map(this.pedidos().map(p => [p.id, p.no]));
    this.avisosCliente.set(r.valor.map(a => ({
      id: a.id, titulo: a.title, texto: a.body, fecha: fechaHora(a.createdAt), ts: new Date(a.createdAt).getTime(),
      leida: a.read, pedidoNo: (a.orderId && noPorId.get(a.orderId)) || '',
    })));
  }

  // ═════════════ Cliente ═════════════

  async crearPedido(d: NuevoPedido): Promise<Resultado<Pedido>> {
    const r = await this.accionPedido(this.http.post<ApiResponse<ApiPedido>>(`${this.base}/pedidos`, {
      paymentMethod: d.metodoPago,
      paymentMethodId: d.tarjetaId ?? null,
      phone: d.telefono,
      province: d.provincia,
      addressLine: d.direccion,
      items: d.items.map(i => ({ productId: i.id, size: i.talla, quantity: i.cantidad })),
      idempotencyKey: d.claveOperacion,
    }));
    if (r.ok) await this.cargarProductos();   // el stock cambió
    return r;
  }

  /** Lo usa el cliente o el admin: el servidor decide qué plazo aplica según el rol. */
  async cancelar(no: string, motivo = ''): Promise<Resultado<Pedido>> {
    const r = await this.accion(no, 'cancelar', { reason: motivo || null }, false);
    if (r.ok) await this.cargarProductos();   // las unidades volvieron al inventario
    return r;
  }
  cambiarDireccion(no: string, provincia: string, direccion: string): Promise<Resultado<Pedido>> {
    const id = this.idDe(no);
    if (!id) return this.noEncontrado();
    return this.accionPedido(this.http.put<ApiResponse<ApiPedido>>(`${this.base}/pedidos/${id}/direccion`, { province: provincia, addressLine: direccion }));
  }
  /** Lo usa el cliente, o el admin en nombre del cliente. */
  reprogramar(no: string, ventana: string): Promise<Resultado<Pedido>> {
    return this.accion(no, 'reprogramar', { window: ventana }, false);
  }
  calificar(no: string, estrellas: number): Promise<Resultado<Pedido>> {
    return this.accion(no, 'calificar', { stars: estrellas }, false);
  }
  solicitarCambio(no: string): Promise<Resultado<Pedido>> {
    return this.accion(no, 'cambio', {}, false);
  }

  // ═════════════ Admin: logística ═════════════

  confirmarPago(no: string) { return this.accion(no, 'confirmar-pago'); }
  async rechazarPago(no: string) {
    const r = await this.accion(no, 'rechazar-pago');
    if (r.ok) await this.cargarProductos();
    return r;
  }
  iniciarPreparacion(no: string) { return this.accion(no, 'preparar'); }
  marcarEmpacado(no: string, paquete: string) { return this.accion(no, 'empacar', { package: paquete }); }
  despachar(no: string) { return this.accion(no, 'despachar'); }
  iniciarReparto(no: string) { return this.accion(no, 'reparto'); }
  registrarIncidencia(no: string, motivo: string) { return this.accion(no, 'incidencia', { reason: motivo }); }
  confirmarEntrega(no: string, codigo: string) { return this.accion(no, 'entregar', { code: codigo }); }

  // ═════════════ Admin: productos e inventario ═════════════

  async guardarProducto(f: { id: string; nombre: string; categoria: Categoria; precio: number; stock: number | null; descripcion: string; visible?: boolean }): Promise<Resultado<Producto>> {
    const cuerpo = { name: f.nombre, category: f.categoria, price: f.precio, description: f.descripcion, stock: f.stock, isVisible: f.visible ?? null };
    const obs = f.id
      ? this.http.put<ApiResponse<ApiProducto>>(`${this.base}/admin/productos/${f.id}`, cuerpo)
      : this.http.post<ApiResponse<ApiProducto>>(`${this.base}/admin/productos`, cuerpo);
    const r = await this.llamar(obs);
    if (!r.ok) return r;
    const nuevo = this.aProducto(r.valor);
    this.productos.update(ps => ps.some(p => p.id === nuevo.id) ? ps.map(p => (p.id === nuevo.id ? nuevo : p)) : [...ps, nuevo]);
    return { ok: true, valor: nuevo };
  }

  async alternarVisible(id: string): Promise<Resultado<Producto>> {
    const p = this.producto(id);
    if (!p) return { ok: false, error: 'Producto no encontrado.' };
    return this.guardarProducto({ id, nombre: p.nombre, categoria: p.categoria, precio: p.precio, stock: null, descripcion: p.descripcion, visible: !p.visible });
  }

  async eliminarProducto(id: string): Promise<Resultado> {
    const r = await this.llamar(this.http.delete<ApiResponse<boolean>>(`${this.base}/admin/productos/${id}`));
    if (!r.ok) return r;
    this.productos.update(ps => ps.filter(p => p.id !== id));
    return { ok: true, valor: undefined };
  }

  async ajustarStock(id: string, delta: number, talla: string | null = null): Promise<Resultado<Producto>> {
    const r = await this.llamar(this.http.post<ApiResponse<ApiProducto>>(`${this.base}/admin/productos/${id}/stock`, { delta, size: talla }));
    if (!r.ok) return r;
    const nuevo = this.aProducto(r.valor);
    this.productos.update(ps => ps.map(p => (p.id === nuevo.id ? nuevo : p)));
    return { ok: true, valor: nuevo };
  }

  // ═════════════ Avisos ═════════════

  marcarLeida(id: string): void {
    if (this.esAdmin) {
      this.leidosAdmin.update(s => new Set(s).add(id));
      this.guardarLeidos();
      return;
    }
    this.avisosCliente.update(ns => ns.map(n => (n.id === id ? { ...n, leida: true } : n)));
    void this.llamar(this.http.post<ApiResponse<boolean>>(`${this.base}/notificaciones/${id}/leida`, {}));
  }
  marcarTodasLeidas(): void {
    if (this.esAdmin) {
      this.leidosAdmin.update(s => new Set([...s, ...this.avisosAdmin().map(n => n.id)]));
      this.guardarLeidos();
      return;
    }
    this.avisosCliente.update(ns => ns.map(n => ({ ...n, leida: true })));
    void this.llamar(this.http.post<ApiResponse<boolean>>(`${this.base}/notificaciones/leidas`, {}));
  }

  // ═════════════ Internos ═════════════

  private idDe(no: string): string | undefined {
    return this.pedido(no)?.id;
  }
  private noEncontrado<T>(): Promise<Resultado<T>> {
    return Promise.resolve({ ok: false, error: 'Pedido no encontrado.' });
  }

  /** POST a `pedidos/{id}/{ruta}` (o `admin/pedidos/{id}/{ruta}` para las acciones del admin). */
  private accion(no: string, ruta: string, cuerpo: object = {}, admin = true): Promise<Resultado<Pedido>> {
    const id = this.idDe(no);
    if (!id) return this.noEncontrado();
    const url = `${this.base}/${admin ? 'admin/' : ''}pedidos/${id}/${ruta}`;
    return this.accionPedido(this.http.post<ApiResponse<ApiPedido>>(url, cuerpo));
  }

  private async accionPedido(obs: Observable<ApiResponse<ApiPedido>>): Promise<Resultado<Pedido>> {
    const r = await this.llamar(obs);
    if (!r.ok) return r;
    const pedido = this.aPedido(r.valor);
    this.pedidos.update(ps => ps.some(p => p.id === pedido.id) ? ps.map(p => (p.id === pedido.id ? pedido : p)) : [pedido, ...ps]);
    if (!this.esAdmin) void this.cargarAvisos();
    return { ok: true, valor: pedido };
  }

  private async llamar<T>(obs: Observable<ApiResponse<T>>): Promise<Resultado<T>> {
    try {
      const r = await firstValueFrom(obs);
      if (r.blnError || r.returnValue === null || r.returnValue === undefined) {
        return { ok: false, error: r.strResponseMessage || 'No se pudo completar la operación.' };
      }
      return { ok: true, valor: r.returnValue };
    } catch (e) {
      const err = e as HttpErrorResponse;
      const msg = (err.error as ApiResponse<unknown> | undefined)?.strResponseMessage;
      if (err.status === 429) return { ok: false, error: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.' };
      if (err.status === 0) return { ok: false, error: 'No hay conexión con el servidor.' };
      return { ok: false, error: msg || 'No se pudo completar la operación.' };
    }
  }

  // ── Mapeo API → modelos de las pantallas ──
  private aProducto(a: ApiProducto): Producto {
    return {
      id: a.id, nombre: a.name, categoria: a.category as Categoria, precio: a.price,
      arte: (a.artType ?? 'pin') as Arte, variante: a.artVariant ?? '', stock: a.stock,
      etiqueta: a.badge, descripcion: a.description, visible: a.isVisible, requiereTalla: a.requiresSize,
      tallas: a.variants.filter(v => v.size).map(v => ({ talla: v.size as string, stock: v.stock })),
      imagen: a.imagePath ? (a.imagePath.startsWith('http') ? a.imagePath : BUCKET_PRODUCTOS + a.imagePath) : '',
    };
  }

  private aPedido(a: ApiPedido): Pedido {
    const eventos: Evento[] = a.events.map(e => ({
      id: e.id, rol: e.actorRole, ts: new Date(e.createdAt).getTime(),
      tipo: TIPO_EVENTO[e.type] ?? 'fase', fase: e.phase ?? undefined,
      fecha: fechaHora(e.createdAt), texto: e.message, quien: e.actorName,
    }));
    const domicilio = [a.canton, a.district, a.addressLine].filter(Boolean).join(', ');
    const red = a.cardNetwork ? (REDES[a.cardNetwork] ?? 'Tarjeta') : 'Tarjeta';
    return {
      id: a.id, no: `BR-${a.orderNumber}`, correo: a.email, cliente: a.customerName, telefono: a.phone,
      metodoPago: a.paymentMethod === 'card' ? 'card' : 'wallet',
      estadoPago: ESTADO_PAGO[a.paymentStatus] ?? 'pendiente',
      direccion: `${a.province}, ${domicilio}`, provincia: a.province, domicilio,
      tarjeta: a.paymentMethod === 'card' && a.cardLastFour ? `${red} •••• ${a.cardLastFour}` : '',
      items: a.items.map(i => ({ id: i.productId, nombre: i.name, talla: i.size, cantidad: i.quantity, precio: i.unitPrice })),
      envio: a.shippingCost, fase: a.fulfillmentPhase, cancelado: a.isCancelled,
      transportista: a.carrierName ?? '', guia: a.trackingNumber ?? '', paquete: a.packageInfo ?? '',
      codigo: a.deliveryCode ?? '', incidenciaAbierta: a.hasOpenIncident, ventana: a.rescheduleWindow ?? '',
      eta: a.isCancelled ? '' : rango(a.etaFrom, a.etaTo), calificacion: a.rating ?? 0, eventos,
    };
  }

  private horaTexto(hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h)) return CORTE_DESPACHO;
    const pm = h >= 12;
    return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${pm ? 'p. m.' : 'a. m.'}`;
  }

  // ── Avisos leídos del admin (solo en este navegador) ──
  private sinHistorialDeLeidos(): boolean {
    try { return localStorage.getItem(LEIDOS_ADMIN) === null; } catch { return false; }
  }
  private leerLeidos(): Set<string> {
    try {
      const raw = localStorage.getItem(LEIDOS_ADMIN);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch { return new Set(); }
  }
  private guardarLeidos(): void {
    try { localStorage.setItem(LEIDOS_ADMIN, JSON.stringify([...this.leidosAdmin()].slice(-500))); } catch { /* sin almacenamiento */ }
  }
}
