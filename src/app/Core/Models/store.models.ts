// Modelos y reglas de la tienda compartidos por el rol usuario y el rol admin.
// Ubicación sugerida: src/app/Core/Models/store.models.ts

export type Categoria = 'Camisetas' | 'Sudaderas y gorras' | 'Accesorios' | 'Hogar' | 'Juegos';
export type Arte = 'tee' | 'hood' | 'cap' | 'mug' | 'key' | 'pin' | 'tote' | 'post' | 'cards' | 'dice' | 'mat' | 'chips';
export type Metodo = 'wallet' | 'card';
/** El pago y la logística son dos estados independientes. */
export type EstadoPago = 'pendiente' | 'confirmado' | 'rechazado' | 'reembolsado';
export type TipoEvento = 'fase' | 'pago' | 'incidencia' | 'reprogramacion' | 'cancelacion' | 'cambio' | 'calificacion';

export interface Producto {
  id: string;
  nombre: string;
  categoria: Categoria;
  precio: number;
  arte: Arte;
  /** Color (hex) de la prenda, la ficha ('5' | '25' | '100') en llaveros, o 'mix' en el set de 100 fichas. */
  variante: string;
  stock: number;
  etiqueta: string;
  descripcion: string;
  visible: boolean;
  requiereTalla: boolean;
  /** Stock por talla (vacío en productos sin talla). `stock` es la suma de todas. */
  tallas: { talla: string; stock: number }[];
  /** URL pública de la foto (Supabase Storage); si falta o falla, se usa el dibujo vectorial. */
  imagen?: string;
}

export interface ItemPedido { id: string; nombre: string; talla: string | null; cantidad: number; precio: number; }

/** Cada cambio queda en la bitácora: qué pasó, quién lo hizo y cuándo. */
export interface Evento {
  tipo: TipoEvento; fase?: number; fecha: string; texto: string; quien: string;
  /** Identificador, rol de quien lo hizo ('user' | 'admin' | 'system') y marca de tiempo (ms). */
  id?: string; rol?: string; ts?: number;
}

export interface Pedido {
  /** Identificador real del pedido; `no` es el número que ve la gente (BR-10242). */
  id: string;
  no: string;
  correo: string;
  cliente: string;
  telefono: string;
  metodoPago: Metodo;
  estadoPago: EstadoPago;
  direccion: string;
  provincia: string;
  canton: string;
  distrito: string;
  /** Señas: dirección exacta sin provincia/cantón/distrito. */
  senas: string;
  /** Provincia, cantón, distrito y señas ya unidos, para poder editarla. */
  domicilio: string;
  /** Tarjeta usada, ya formateada (por ejemplo "Visa •••• 4242"); vacío si pagó con billetera. */
  tarjeta: string;
  items: ItemPedido[];
  envio: number;
  /** Etapa logística: 0 recibido, 1 pago confirmado, 2 preparación, 3 empacado, 4 con el transportista, 5 en reparto, 6 entregado. */
  fase: number;
  cancelado: boolean;
  transportista: string;
  guia: string;
  paquete: string;
  /** Código de 4 dígitos que el cliente le da al repartidor al recibir el pedido. */
  codigo: string;
  incidenciaAbierta: boolean;
  ventana: string;
  eta: string;
  calificacion: number;
  eventos: Evento[];
}

export interface StoreNotificacion {
  id: string;
  titulo: string;
  texto: string;
  fecha: string;
  /** Marca de tiempo (ms) para detectar avisos nuevos. */
  ts: number;
  leida: boolean;
  pedidoNo: string;
}

export interface NuevoPedido {
  metodoPago: Metodo;
  /** Obligatorio con tarjeta: id de una tarjeta ya registrada en Métodos de pago. */
  tarjetaId?: string;
  telefono: string;
  provincia: string;
  canton: string;
  distrito: string;
  /** Señas: dirección exacta (casa, color, puntos de referencia). */
  direccion: string;
  items: { id: string; talla: string | null; cantidad: number }[];
  /** Evita crear dos pedidos si el cliente reintenta la misma compra. */
  claveOperacion: string;
}

// ───────────── Reglas del negocio ─────────────
// Valores por defecto; los reales los entrega el servidor (StoreService.config).
export const ENVIO_GRATIS_DESDE = 60;
export const COSTO_ENVIO = 5;
export const CORTE_DESPACHO = '2:00 p. m.';

export interface Etapa { fase: number; nombre: string; texto: string; }

export const ETAPAS: Etapa[] = [
  { fase: 0, nombre: 'Pedido recibido', texto: 'Recibimos tu pedido.' },
  { fase: 1, nombre: 'Pago confirmado', texto: 'Verificamos tu pago.' },
  { fase: 2, nombre: 'En preparación', texto: 'Estamos preparando tu pedido.' },
  { fase: 3, nombre: 'Empacado', texto: 'Está empacado y listo para salir.' },
  { fase: 4, nombre: 'Con el transportista', texto: 'Salió con el transportista.' },
  { fase: 5, nombre: 'En reparto', texto: 'Va en camino a tu dirección.' },
  { fase: 6, nombre: 'Entregado', texto: 'Entregado. ¡Que lo disfrutes!' },
];

export function etapaActual(p: Pedido): Etapa {
  return ETAPAS.find(e => e.fase === p.fase) ?? ETAPAS[0];
}
export function subtotalPedido(p: Pedido): number {
  return p.items.reduce((a, i) => a + i.precio * i.cantidad, 0);
}
export function totalPedido(p: Pedido): number {
  return subtotalPedido(p) + p.envio;
}

/** Grupos de trabajo del tablero de logística. */
export type Grupo = 'Por verificar pago' | 'Por preparar' | 'En preparación' | 'Por despachar' | 'En ruta' | 'Incidencias' | 'Entregados' | 'Cancelados';
export const GRUPOS: Grupo[] = ['Por verificar pago', 'Por preparar', 'En preparación', 'Por despachar', 'En ruta', 'Incidencias', 'Entregados', 'Cancelados'];
export const GRUPOS_ACTIVOS: Grupo[] = GRUPOS.slice(0, 6);

export function grupoDe(p: Pedido): Grupo {
  if (p.cancelado) return 'Cancelados';
  if (p.fase === 6) return 'Entregados';
  if (p.incidenciaAbierta) return 'Incidencias';
  if (p.fase === 0) return 'Por verificar pago';
  if (p.fase === 1) return 'Por preparar';
  if (p.fase === 2) return 'En preparación';
  if (p.fase === 3) return 'Por despachar';
  return 'En ruta';
}

/** El cliente puede cancelar hasta que el pedido esté empacado; el admin, hasta que salga. */
export function puedeCancelar(p: Pedido, rol: 'cliente' | 'admin'): boolean {
  if (p.cancelado || p.fase >= 6) return false;
  return rol === 'cliente' ? p.fase <= 2 : p.fase <= 3;
}

/** Único transportista de la tienda. */
export const TRANSPORTISTA = { nombre: 'Correos de Costa Rica', prefijoGuia: 'CR', tarifa: 5, tiempo: '2 a 3 días' };
// ───────── Textos y fechas de un pedido (los usan el rol usuario y el rol admin) ─────────
export function textoPago(p: Pedido): string {
  return { pendiente: 'Por verificar', confirmado: 'Confirmado', rechazado: 'Rechazado', reembolsado: 'Reembolsado' }[p.estadoPago];
}
export function textoMetodo(p: Pedido): string {
  return { wallet: 'Billetera', card: 'Tarjeta' }[p.metodoPago];
}
/** Fecha y hora del primer evento de una etapa (vacío si todavía no ocurrió). */
export function fechaDeFase(p: Pedido, fase: number): string {
  return p.eventos.find(x => x.fase === fase)?.fecha ?? '';
}
