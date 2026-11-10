import { Pedido, Producto, grupoDe } from 'src/app/Core/Models/store.models';

/** Con 5 unidades o menos, un producto se considera con stock bajo. */
export const STOCK_BAJO = 5;

/** Color de la etiqueta de etapa en el tablero de logística. */
export function claseGrupo(p: Pedido): string {
  const g = grupoDe(p);
  return g === 'Cancelados' || g === 'Incidencias' ? 'rojo' : g === 'Por verificar pago' || g === 'Por preparar' ? 'ambar'
    : g === 'En ruta' ? 'violeta' : g === 'Entregados' ? 'verde' : 'azul';
}

/** Fecha del último evento de la bitácora del pedido. */
export function ultimoMovimiento(p: Pedido): string {
  return p.eventos[p.eventos.length - 1]?.fecha ?? '';
}

export function estadoStock(p: Producto): { texto: string; clase: string } {
  if (p.stock <= 0) return { texto: 'Agotado', clase: 'agotado' };
  if (p.stock <= STOCK_BAJO) return { texto: 'Stock bajo', clase: 'bajo' };
  return { texto: 'Disponible', clase: 'ok' };
}

/** Color de fondo de la miniatura: el de la prenda si lo tiene. */
export function colorDe(p: Producto): string {
  return p.variante.startsWith('#') ? p.variante : '#1b150a';
}
