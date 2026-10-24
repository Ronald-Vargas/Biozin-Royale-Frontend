// Modelos y reglas de la tienda compartidos por el rol usuario y el rol admin.
// Ubicación sugerida: src/app/Core/Models/store.models.ts

export type Categoria = 'Camisetas' | 'Sudaderas y gorras' | 'Accesorios' | 'Hogar' | 'Juegos';
export type Arte = 'tee' | 'hood' | 'cap' | 'mug' | 'key' | 'pin' | 'tote' | 'post' | 'cards' | 'dice' | 'mat' | 'chips';
export type Rol = 'admin' | 'soporte' | 'cliente';
export type Metodo = 'wallet' | 'card' | 'sinpe';
export type Entrega = 'domicilio' | 'retiro';
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
}

export interface Usuario { nombre: string; correo: string; rol: Rol; activo: boolean; }

export interface ItemPedido { id: string; nombre: string; talla: string | null; cantidad: number; precio: number; }

/** Cada cambio queda en la bitácora: qué pasó, quién lo hizo y cuándo. */
export interface Evento { tipo: TipoEvento; fase?: number; fecha: string; texto: string; quien: string; }

export interface Pedido {
  no: string;
  correo: string;
  cliente: string;
  telefono: string;
  metodoPago: Metodo;
  estadoPago: EstadoPago;
  entrega: Entrega;
  direccion: string;
  items: ItemPedido[];
  envio: number;
  /** Etapa logística: 0 recibido, 1 pago confirmado, 2 preparación, 3 empacado, 4 con el transportista, 5 en reparto, 6 entregado. */
  fase: number;
  cancelado: boolean;
  transportista: string;
  guia: string;
  paquete: string;
  /** Código de 4 dígitos que el cliente entrega al recibir (domicilio) o retirar (retiro en punto). */
  codigo: string;
  incidenciaAbierta: boolean;
  ventana: string;
  eta: string;
  calificacion: number;
  eventos: Evento[];
}

export interface StoreNotificacion {
  id: number;
  correo: string;
  titulo: string;
  texto: string;
  fecha: string;
  leida: boolean;
  pedidoNo: string;
}

export interface NuevoPedido {
  correo: string;
  cliente: string;
  telefono: string;
  metodoPago: Metodo;
  entrega: Entrega;
  direccion: string;
  items: { id: string; talla: string | null; cantidad: number }[];
  envio: number;
}

// ───────────── Reglas del negocio ─────────────
export const ENVIO_GRATIS_DESDE = 60;
export const COSTO_ENVIO = 5;
export const CORTE_DESPACHO = '2:00 p. m.';
export const PROVINCIAS = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];
export const GAM = ['San José', 'Alajuela', 'Cartago', 'Heredia'];

export interface Etapa { fase: number; nombre: string; texto: string; }

const ETAPAS_DOMICILIO: Etapa[] = [
  { fase: 0, nombre: 'Pedido recibido', texto: 'Recibimos tu pedido.' },
  { fase: 1, nombre: 'Pago confirmado', texto: 'Verificamos tu pago.' },
  { fase: 2, nombre: 'En preparación', texto: 'Estamos preparando tu pedido.' },
  { fase: 3, nombre: 'Empacado', texto: 'Está empacado y listo para salir.' },
  { fase: 4, nombre: 'Con el transportista', texto: 'Salió con el transportista.' },
  { fase: 5, nombre: 'En reparto', texto: 'Va en camino a tu dirección.' },
  { fase: 6, nombre: 'Entregado', texto: 'Entregado. ¡Que lo disfrutes!' },
];

/** El retiro en punto no tiene transportista ni reparto. */
const ETAPAS_RETIRO: Etapa[] = [
  ETAPAS_DOMICILIO[0], ETAPAS_DOMICILIO[1], ETAPAS_DOMICILIO[2], ETAPAS_DOMICILIO[3],
  { fase: 4, nombre: 'Listo para retirar', texto: 'Ya puedes pasar a retirarlo con tu código.' },
  { fase: 6, nombre: 'Entregado', texto: 'Retirado. ¡Que lo disfrutes!' },
];

export function etapasDe(p: Pedido): Etapa[] {
  return p.entrega === 'retiro' ? ETAPAS_RETIRO : ETAPAS_DOMICILIO;
}
export function etapaActual(p: Pedido): Etapa {
  const etapas = etapasDe(p);
  return etapas.find(e => e.fase === p.fase) ?? etapas[0];
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

export interface Transportista { id: string; nombre: string; tarifa: number; tiempo: string; cobertura: string; }
export const TRANSPORTISTAS: Transportista[] = [
  { id: 'correos', nombre: 'Correos de Costa Rica', tarifa: 5, tiempo: '2 a 3 días', cobertura: 'Todo el país' },
  { id: 'local', nombre: 'Mensajería local', tarifa: 3, tiempo: '1 día', cobertura: 'Gran Área Metropolitana' },
];
export function provinciaDe(direccion: string): string {
  return direccion.split(',')[0].trim();
}
export function cubre(t: Transportista, direccion: string): boolean {
  return t.id !== 'local' || GAM.includes(provinciaDe(direccion));
}