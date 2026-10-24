import { Injectable, signal } from '@angular/core';
import {
  Categoria, Arte, Entrega, Evento, NuevoPedido, Pedido, Producto, StoreNotificacion, TipoEvento, Usuario,
  TRANSPORTISTAS, cubre, puedeCancelar, totalPedido,
} from 'src/app/Core/Models/store.models';

// Servicio de la tienda con datos simulados en memoria.
// Ubicación sugerida: src/app/Core/Services/store-demo.service.ts
// Cuando exista la API, se reemplaza el interior de cada método por una llamada HTTP:
// los componentes de usuario y admin no cambian.

const ADMIN_CORREO = 'admin@biozin.com';

// ───────────── Utilidades de fecha ─────────────
function ahora(): string {
  const d = new Date();
  const dia = d.toLocaleDateString('es-CR', { weekday: 'short' }).replace('.', '');
  const fecha = d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }).replace('.', '');
  const hora = d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dia} ${fecha} · ${hora}`;
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
function corto(d: Date, conMes: boolean): string {
  const dia = d.toLocaleDateString('es-CR', { weekday: 'short' }).replace('.', '');
  const mes = d.toLocaleDateString('es-CR', { month: 'short' }).replace('.', '');
  return `${dia} ${d.getDate()}${conMes ? ' ' + mes : ''}`;
}
function estimar(entrega: Entrega): string {
  if (entrega === 'retiro') return 'Listo para retirar en 24 horas';
  const a = sumarHabiles(2);
  const b = sumarHabiles(3);
  const distinto = a.getMonth() !== b.getMonth();
  return `${corto(a, distinto)} – ${corto(b, true)}`;
}
function dinero(n: number): string {
  return `$${n.toFixed(2)}`;
}

// ───────────── Datos simulados ─────────────
const crear = (
  id: string, nombre: string, categoria: Categoria, precio: number, arte: Arte,
  variante: string, stock: number, etiqueta: string, descripcion: string,
): Producto => ({
  id, nombre, categoria, precio, arte, variante, stock, etiqueta, descripcion,
  visible: true,
  requiereTalla: arte === 'tee' || arte === 'hood',
});

const PRODUCTOS_DEMO: Producto[] = [
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

const USUARIOS_DEMO: Usuario[] = [
  { nombre: 'Admin Royale', correo: ADMIN_CORREO, rol: 'admin', activo: true },
  { nombre: 'Soporte Royale', correo: 'soporte@biozin.com', rol: 'soporte', activo: true },
  { nombre: 'Ana Mora', correo: 'cliente@biozin.com', rol: 'cliente', activo: true },
  { nombre: 'Luis Vargas', correo: 'luis@correo.com', rol: 'cliente', activo: true },
  { nombre: 'Marta Solís', correo: 'marta@correo.com', rol: 'cliente', activo: false },
];

const ev = (tipo: TipoEvento, fase: number | undefined, fecha: string, texto: string, quien: string): Evento =>
  ({ tipo, fase, fecha, texto, quien });

const ANA = { correo: 'cliente@biozin.com', cliente: 'Ana Mora', telefono: '88887777' };
const LUIS = { correo: 'luis@correo.com', cliente: 'Luis Vargas', telefono: '86543210' };
const MARTA = { correo: 'marta@correo.com', cliente: 'Marta Solís', telefono: '85551234' };
const SANTA_ROSA = 'Limón, Barrio Santa Rosa, 200 m norte de la escuela';
const HEREDIA = 'Heredia, Centro, frente al parque';

const PEDIDOS_DEMO: Pedido[] = [
  {
    ...ANA, no: 'BR-10241', metodoPago: 'sinpe', estadoPago: 'pendiente', entrega: 'domicilio', direccion: SANTA_ROSA,
    items: [{ id: 't1', nombre: 'Camiseta Royale', talla: 'M', cantidad: 2, precio: 28 }, { id: 'g1', nombre: 'Gorra Royale Negra', talla: null, cantidad: 1, precio: 24 }],
    envio: 0, fase: 0, cancelado: false, transportista: '', guia: '', paquete: '', codigo: '4827',
    incidenciaAbierta: false, ventana: '', eta: 'mar 20 – mié 21 oct', calificacion: 0,
    eventos: [ev('fase', 0, 'lun 19 oct · 10:06', 'Pedido creado · SINPE Móvil', 'Ana Mora')],
  },
  {
    ...LUIS, no: 'BR-10238', metodoPago: 'sinpe', estadoPago: 'confirmado', entrega: 'domicilio', direccion: HEREDIA,
    items: [{ id: 'h1', nombre: 'Sudadera High Roller', talla: 'L', cantidad: 1, precio: 62 }],
    envio: 0, fase: 2, cancelado: false, transportista: '', guia: '', paquete: '', codigo: '7305',
    incidenciaAbierta: false, ventana: '', eta: 'mar 20 – mié 21 oct', calificacion: 0,
    eventos: [
      ev('fase', 0, 'dom 18 oct · 16:40', 'Pedido creado · SINPE Móvil', 'Luis Vargas'),
      ev('pago', 1, 'dom 18 oct · 17:05', 'Pago confirmado', 'Admin Royale'),
      ev('fase', 2, 'lun 19 oct · 08:30', 'Preparación iniciada', 'Admin Royale'),
    ],
  },
  {
    ...ANA, no: 'BR-10230', metodoPago: 'card', estadoPago: 'confirmado', entrega: 'domicilio', direccion: SANTA_ROSA,
    items: [{ id: 'j2', nombre: 'Set de 50 fichas', talla: null, cantidad: 1, precio: 39 }],
    envio: 5, fase: 5, cancelado: false, transportista: 'Correos de Costa Rica', guia: 'CR-48103321', paquete: 'Caja M · 1,2 kg', codigo: '5190',
    incidenciaAbierta: false, ventana: '', eta: 'lun 19 – mar 20 oct', calificacion: 0,
    eventos: [
      ev('fase', 0, 'vie 16 oct · 14:10', 'Pedido creado · Tarjeta', 'Ana Mora'),
      ev('pago', 1, 'vie 16 oct · 14:10', 'Pago confirmado automáticamente', 'Sistema'),
      ev('fase', 2, 'vie 16 oct · 15:20', 'Preparación iniciada', 'Admin Royale'),
      ev('fase', 3, 'vie 16 oct · 15:50', 'Empacado · Caja M · 1,2 kg', 'Admin Royale'),
      ev('fase', 4, 'vie 16 oct · 16:10', 'Guía CR-48103321 · entregado a Correos de Costa Rica', 'Admin Royale'),
      ev('fase', 5, 'lun 19 oct · 08:00', 'En reparto', 'Sistema'),
    ],
  },
  {
    ...LUIS, no: 'BR-10215', metodoPago: 'wallet', estadoPago: 'confirmado', entrega: 'domicilio', direccion: HEREDIA,
    items: [{ id: 'r1', nombre: 'Taza Jackpot', talla: null, cantidad: 2, precio: 14 }, { id: 'r3', nombre: 'Pin Royale', talla: null, cantidad: 1, precio: 6 }],
    envio: 5, fase: 6, cancelado: false, transportista: 'Mensajería local', guia: 'ML-20931845', paquete: 'Caja S · 0,7 kg', codigo: '2468',
    incidenciaAbierta: false, ventana: '', eta: 'vie 9 – lun 12 oct', calificacion: 5,
    eventos: [
      ev('fase', 0, 'mié 7 oct · 11:00', 'Pedido creado · Billetera', 'Luis Vargas'),
      ev('pago', 1, 'mié 7 oct · 11:00', 'Pago confirmado automáticamente', 'Sistema'),
      ev('fase', 2, 'mié 7 oct · 13:10', 'Preparación iniciada', 'Admin Royale'),
      ev('fase', 3, 'mié 7 oct · 13:40', 'Empacado · Caja S · 0,7 kg', 'Admin Royale'),
      ev('fase', 4, 'mié 7 oct · 14:05', 'Guía ML-20931845 · entregado a Mensajería local', 'Admin Royale'),
      ev('fase', 5, 'jue 8 oct · 08:15', 'En reparto', 'Sistema'),
      ev('fase', 6, 'jue 8 oct · 10:20', 'Entregado · código verificado', 'Repartidor'),
      ev('calificacion', undefined, 'jue 8 oct · 18:00', 'Calificó la entrega con 5 estrellas', 'Luis Vargas'),
    ],
  },
  {
    ...MARTA, no: 'BR-10202', metodoPago: 'sinpe', estadoPago: 'rechazado', entrega: 'domicilio', direccion: 'San José, Escazú, Calle Real',
    items: [{ id: 'r1', nombre: 'Taza Jackpot', talla: null, cantidad: 2, precio: 14 }],
    envio: 5, fase: 0, cancelado: true, transportista: '', guia: '', paquete: '', codigo: '9031',
    incidenciaAbierta: false, ventana: '', eta: '', calificacion: 0,
    eventos: [
      ev('fase', 0, 'jue 1 oct · 09:30', 'Pedido creado · SINPE Móvil', 'Marta Solís'),
      ev('cancelacion', undefined, 'vie 2 oct · 09:35', 'Cancelado: pago no recibido', 'Admin Royale'),
    ],
  },
];

const NOTIFICACIONES_DEMO: StoreNotificacion[] = [
  { id: 1, correo: 'cliente@biozin.com', titulo: 'Tu pedido va en camino', texto: 'Código de entrega: 5190', fecha: 'lun 19 oct · 08:00', leida: false, pedidoNo: 'BR-10230' },
  { id: 2, correo: ADMIN_CORREO, titulo: 'Nuevo pedido BR-10241', texto: 'Ana Mora · $80.00 · SINPE por verificar', fecha: 'lun 19 oct · 10:06', leida: false, pedidoNo: 'BR-10241' },
];

// ───────────── Servicio ─────────────
@Injectable({ providedIn: 'root' })
export class StoreDemoService {
  readonly adminCorreo = ADMIN_CORREO;
  readonly productos = signal<Producto[]>(PRODUCTOS_DEMO);
  readonly pedidos = signal<Pedido[]>(PEDIDOS_DEMO);
  readonly usuarios = signal<Usuario[]>(USUARIOS_DEMO);
  readonly notificaciones = signal<StoreNotificacion[]>(NOTIFICACIONES_DEMO);
  /** Lo que el cliente gastó de su billetera en esta sesión de simulación. */
  readonly gastadoBilletera = signal(0);
  private contador = 100;

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

  // ── Creación ──
  crearPedido(d: NuevoPedido): Pedido {
    const items = d.items.map(i => {
      const p = this.producto(i.id);
      return { id: i.id, nombre: p?.nombre ?? 'Producto', talla: i.talla, cantidad: i.cantidad, precio: p?.precio ?? 0 };
    });
    const inmediato = d.metodoPago !== 'sinpe';
    const metodo = d.metodoPago === 'wallet' ? 'Billetera' : d.metodoPago === 'card' ? 'Tarjeta' : 'SINPE Móvil';
    const fecha = ahora();
    const pedido: Pedido = {
      no: `BR-${10242 + this.pedidos().length}`,
      correo: d.correo, cliente: d.cliente, telefono: d.telefono,
      metodoPago: d.metodoPago,
      estadoPago: inmediato ? 'confirmado' : 'pendiente',
      entrega: d.entrega,
      direccion: d.entrega === 'retiro' ? 'Retiro en punto: Biozin Royale, Guácimo' : d.direccion,
      items, envio: d.envio,
      fase: inmediato ? 1 : 0,
      cancelado: false,
      transportista: d.entrega === 'retiro' ? 'Retiro en punto' : '',
      guia: '', paquete: '',
      codigo: String(1000 + Math.floor(Math.random() * 9000)),
      incidenciaAbierta: false, ventana: '',
      eta: estimar(d.entrega),
      calificacion: 0,
      eventos: [ev('fase', 0, fecha, `Pedido creado · ${metodo}`, d.cliente)],
    };
    if (inmediato) pedido.eventos.push(ev('pago', 1, fecha, 'Pago confirmado automáticamente', 'Sistema'));

    // Descuenta el stock y, si paga con billetera, el saldo.
    this.productos.update(ps => ps.map(p => {
      const vendidas = items.filter(i => i.id === p.id).reduce((a, i) => a + i.cantidad, 0);
      return vendidas ? { ...p, stock: p.stock - vendidas } : p;
    }));
    if (d.metodoPago === 'wallet') this.gastadoBilletera.update(g => g + totalPedido(pedido));

    this.pedidos.update(ps => [pedido, ...ps]);
    this.notificar(d.correo, 'Pedido recibido', inmediato ? `Tu pedido ${pedido.no} está confirmado.` : `Recibimos tu pedido ${pedido.no}. Estamos verificando el pago.`, pedido.no);
    this.notificar(ADMIN_CORREO, `Nuevo pedido ${pedido.no}`, `${d.cliente} · ${dinero(totalPedido(pedido))} · ${metodo}${inmediato ? '' : ' por verificar'}`, pedido.no);
    return pedido;
  }

  // ── Logística (lo ejecuta el admin) ──
  confirmarPago(no: string, quien: string): boolean {
    const p = this.pedido(no);
    if (!p || p.cancelado || p.estadoPago !== 'pendiente') return false;
    this.actualizar(no, x => ({ ...x, estadoPago: 'confirmado', fase: Math.max(x.fase, 1), eventos: [...x.eventos, this.evento('pago', 'Pago confirmado', quien, 1)] }));
    this.notificar(p.correo, 'Pago confirmado', `Verificamos tu pago de ${dinero(totalPedido(p))}.`, no);
    return true;
  }
  rechazarPago(no: string, quien: string): boolean {
    const p = this.pedido(no);
    if (!p || p.cancelado || p.estadoPago !== 'pendiente') return false;
    return this.anular(no, quien, 'admin', 'Pago no recibido', 'rechazado');
  }
  iniciarPreparacion(no: string, quien: string): boolean {
    const p = this.mover(no, 1, 2, 'Preparación iniciada', quien);
    if (p) this.notificar(p.correo, 'En preparación', 'Estamos preparando tu pedido.', no);
    return !!p;
  }
  marcarEmpacado(no: string, paquete: string, quien: string): boolean {
    const p = this.mover(no, 2, 3, `Empacado · ${paquete}`, quien, { paquete });
    if (p) this.notificar(p.correo, 'Empacado', 'Tu pedido está listo para salir.', no);
    return !!p;
  }
  despachar(no: string, transportistaId: string, quien: string): boolean {
    const t = TRANSPORTISTAS.find(x => x.id === transportistaId);
    const actual = this.pedido(no);
    if (!t || !actual || actual.entrega !== 'domicilio' || !cubre(t, actual.direccion)) return false;
    const guia = `${t.id === 'correos' ? 'CR' : 'ML'}-${Math.floor(10000000 + Math.random() * 89999999)}`;
    const p = this.mover(no, 3, 4, `Guía ${guia} · entregado a ${t.nombre}`, quien, { transportista: t.nombre, guia });
    if (p) this.notificar(p.correo, 'Salió tu pedido', `${t.nombre} · guía ${guia}`, no);
    return !!p;
  }
  marcarListoRetiro(no: string, quien: string): boolean {
    const actual = this.pedido(no);
    if (!actual || actual.entrega !== 'retiro') return false;
    const p = this.mover(no, 3, 4, 'Listo para retirar', quien);
    if (p) this.notificar(p.correo, 'Listo para retirar', `Pasa por Biozin Royale con tu código: ${p.codigo}`, no);
    return !!p;
  }
  iniciarReparto(no: string, quien: string): boolean {
    const actual = this.pedido(no);
    if (!actual || actual.entrega !== 'domicilio') return false;
    const p = this.mover(no, 4, 5, 'En reparto', quien);
    if (p) this.notificar(p.correo, 'Tu pedido va en camino', `Código de entrega: ${p.codigo}`, no);
    return !!p;
  }
  registrarIncidencia(no: string, motivo: string, quien: string): boolean {
    const p = this.pedido(no);
    if (!p || p.cancelado || p.fase !== 5 || p.incidenciaAbierta) return false;
    this.actualizar(no, x => ({ ...x, incidenciaAbierta: true, eventos: [...x.eventos, this.evento('incidencia', `Intento fallido · ${motivo}`, quien)] }));
    this.notificar(p.correo, 'No pudimos entregar', 'Elige una nueva fecha de entrega.', no);
    return true;
  }
  /** Lo usa el cliente desde su seguimiento, o el admin en nombre del cliente. */
  reprogramar(no: string, ventana: string, quien: string, esCliente: boolean): boolean {
    const p = this.pedido(no);
    if (!p || !p.incidenciaAbierta) return false;
    this.actualizar(no, x => ({ ...x, incidenciaAbierta: false, ventana, eta: ventana, eventos: [...x.eventos, this.evento('reprogramacion', `Entrega reprogramada · ${ventana}`, quien)] }));
    if (esCliente) this.notificar(ADMIN_CORREO, `Entrega reprogramada ${no}`, `${p.cliente} eligió ${ventana}`, no);
    else this.notificar(p.correo, 'Entrega reprogramada', ventana, no);
    return true;
  }
  /** Devuelve false si el código no coincide: sin el código no se cierra la entrega. */
  confirmarEntrega(no: string, codigo: string, quien: string): boolean {
    const p = this.pedido(no);
    if (!p || p.cancelado || p.incidenciaAbierta) return false;
    const listo = (p.entrega === 'domicilio' && p.fase === 5) || (p.entrega === 'retiro' && p.fase === 4);
    if (!listo || codigo.trim() !== p.codigo) return false;
    this.actualizar(no, x => ({ ...x, fase: 6, eventos: [...x.eventos, this.evento('fase', 'Entregado · código verificado', quien, 6)] }));
    this.notificar(p.correo, 'Entregado', 'Gracias por tu compra.', no);
    return true;
  }

  // ── Acciones del cliente y de ambos ──
  cancelar(no: string, quien: string, rol: 'cliente' | 'admin', motivo = ''): boolean {
    return this.anular(no, quien, rol, motivo || (rol === 'cliente' ? 'Cancelado por el cliente' : 'Cancelado por la tienda'), null);
  }
  cambiarDireccion(no: string, direccion: string, quien: string): boolean {
    const p = this.pedido(no);
    if (!p || p.cancelado || p.fase > 2 || p.entrega !== 'domicilio') return false;
    this.actualizar(no, x => ({ ...x, direccion, eventos: [...x.eventos, this.evento('cambio', `Dirección actualizada · ${direccion}`, quien)] }));
    this.notificar(ADMIN_CORREO, `Dirección cambiada ${no}`, `${p.cliente} actualizó la dirección de envío.`, no);
    return true;
  }
  calificar(no: string, estrellas: number, quien: string): boolean {
    const p = this.pedido(no);
    if (!p || p.fase !== 6 || p.calificacion) return false;
    this.actualizar(no, x => ({ ...x, calificacion: estrellas, eventos: [...x.eventos, this.evento('calificacion', `Calificó la entrega con ${estrellas} estrellas`, quien)] }));
    return true;
  }
  solicitarCambio(no: string, quien: string): boolean {
    const p = this.pedido(no);
    if (!p || p.fase !== 6) return false;
    this.actualizar(no, x => ({ ...x, eventos: [...x.eventos, this.evento('cambio', 'Solicitó un cambio o devolución', quien)] }));
    this.notificar(ADMIN_CORREO, `Cambio solicitado ${no}`, `${p.cliente} pidió un cambio o devolución.`, no);
    return true;
  }

  // ── Notificaciones ──
  notificar(correo: string, titulo: string, texto: string, pedidoNo: string): void {
    this.notificaciones.update(ns => [{ id: ++this.contador, correo, titulo, texto, fecha: ahora(), leida: false, pedidoNo }, ...ns]);
  }
  marcarLeida(id: number): void {
    this.notificaciones.update(ns => ns.map(n => (n.id === id ? { ...n, leida: true } : n)));
  }
  marcarTodasLeidas(correo: string): void {
    this.notificaciones.update(ns => ns.map(n => (n.correo === correo ? { ...n, leida: true } : n)));
  }

  // ── Internos ──
  private evento(tipo: TipoEvento, texto: string, quien: string, fase?: number): Evento {
    return ev(tipo, fase, ahora(), texto, quien);
  }
  private actualizar(no: string, cambio: (p: Pedido) => Pedido): void {
    this.pedidos.update(ps => ps.map(p => (p.no === no ? cambio(p) : p)));
  }
  /** Avanza un pedido de una etapa a la siguiente y deja el evento en la bitácora. */
  private mover(no: string, desde: number, hasta: number, texto: string, quien: string, extra: Partial<Pedido> = {}): Pedido | null {
    const p = this.pedido(no);
    if (!p || p.cancelado || p.fase !== desde || p.incidenciaAbierta) return null;
    this.actualizar(no, x => ({ ...x, ...extra, fase: hasta, eventos: [...x.eventos, this.evento('fase', texto, quien, hasta)] }));
    return this.pedido(no) ?? null;
  }
  /** Cancela, devuelve las unidades al inventario y reembolsa si ya se había pagado. */
  private anular(no: string, quien: string, rol: 'cliente' | 'admin', motivo: string, pago: 'rechazado' | null): boolean {
    const p = this.pedido(no);
    if (!p || !puedeCancelar(p, rol)) return false;
    const reembolsa = p.estadoPago === 'confirmado';
    this.actualizar(no, x => ({
      ...x,
      cancelado: true,
      estadoPago: pago ?? (reembolsa ? 'reembolsado' : x.estadoPago),
      eventos: [...x.eventos, this.evento('cancelacion', reembolsa ? `${motivo} · reembolso en proceso` : motivo, quien)],
    }));
    this.productos.update(ps => ps.map(pr => {
      const devueltas = p.items.filter(i => i.id === pr.id).reduce((a, i) => a + i.cantidad, 0);
      return devueltas ? { ...pr, stock: pr.stock + devueltas } : pr;
    }));
    if (reembolsa && p.metodoPago === 'wallet') this.gastadoBilletera.update(g => g - totalPedido(p));
    this.notificar(p.correo, 'Pedido cancelado', reembolsa ? 'Te devolvemos tu pago.' : motivo, no);
    if (rol === 'cliente') this.notificar(ADMIN_CORREO, `Pedido cancelado ${no}`, `${p.cliente} canceló su pedido.`, no);
    return true;
  }
}