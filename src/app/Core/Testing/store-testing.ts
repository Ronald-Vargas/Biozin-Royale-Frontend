import { HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

// Datos y utilidades compartidas por los specs de la tienda (rol usuario y rol admin).

export const API = `${environment.apiUrl}/tienda`;

export const ok = <T>(returnValue: T) => ({ returnValue, strResponseMessage: '', blnError: false, strResponseTittle: '' });
export const fallo = (mensaje: string) => ({ returnValue: null, strResponseMessage: mensaje, blnError: true, strResponseTittle: 'Error' });
export const BAD_REQUEST = { status: 400, statusText: 'Bad Request' };

export const configApi = { freeShippingFrom: 60, shippingCost: 5, dispatchCutoff: '14:00', returnWindowDays: 15 };

export const camisaApi = {
  id: 'p-camisa', name: 'Camiseta Royale', category: 'Camisetas', description: 'Algodón', price: 28,
  artType: 'tee', artVariant: '#15110a', badge: '', imagePath: 'br-t1.webp',
  requiresSize: true, isVisible: true, stock: 2,
  variants: [{ id: 'v-m', size: 'M', stock: 2 }, { id: 'v-l', size: 'L', stock: 0 }],
};
export const llaveroApi = {
  id: 'p-llavero', name: 'Llavero Ficha 5', category: 'Accesorios', description: '', price: 8,
  artType: 'key', artVariant: '5', badge: '', imagePath: null,
  requiresSize: false, isVisible: true, stock: 2,
  variants: [{ id: 'v-k', size: null, stock: 2 }],
};
export const productoApi = (id: string, stock: number, extra: object = {}) => ({
  id, name: `Producto ${id}`, category: 'Camisetas', description: '', price: 10, artType: 'pin', artVariant: '',
  badge: '', imagePath: null, requiresSize: false, isVisible: true, stock,
  variants: [{ id: `v-${id}`, size: null, stock }], ...extra,
});

export const tarjetaApi = {
  id: 'card-1', type: 'card', alias: null, isDefault: true, createdAt: '', cardHolder: 'Ana Mora',
  lastFour: '4242', network: 'visa', expiryMonth: 12, expiryYear: 2030,
};

/** Un pedido con tarjeta, pago por verificar, recién creado. */
export const pedidoApi = (extra: object = {}) => ({
  id: 'o-1', orderNumber: 10241, userId: 'u-1', customerName: 'Ana Mora', email: 'ana@correo.com', phone: '88887777',
  province: 'Limón', canton: null, district: null, addressLine: 'Barrio Santa Rosa', subtotal: 28, shippingCost: 5, total: 33,
  paymentMethod: 'card', paymentStatus: 'pending', cardLastFour: '4242', cardNetwork: 'visa', fulfillmentPhase: 0,
  isCancelled: false, carrierName: null, trackingNumber: null, packageInfo: null, deliveryCode: null, hasOpenIncident: false,
  rescheduleWindow: null, etaFrom: '2026-11-11', etaTo: '2026-11-12', rating: null, createdAt: '2026-11-09T16:00:00Z',
  items: [{ productId: 'p-camisa', name: 'Camiseta Royale', size: 'M', quantity: 1, unitPrice: 28 }],
  events: [{ id: 'e-1', type: 'phase', phase: 0, message: 'Pedido creado · Tarjeta', actorName: 'Ana Mora', actorRole: 'user', createdAt: '2026-11-09T16:00:00Z' }],
  ...extra,
});

export interface RespuestasTienda {
  saldo?: number;
  productos?: object[];
  pedidos?: object[];
  avisos?: object[];
  tarjetas?: object[];
  telefono?: string;
}

/** Cede un tick real al event loop para que las promesas encadenen la siguiente petición. */
export const tick = () => new Promise<void>(r => setTimeout(r));

/**
 * Responde todas las peticiones pendientes de la tienda (y las que se encadenan) con datos de prueba.
 * Sirve tanto para el rol usuario como para el admin.
 */
export async function responder(http: HttpTestingController, d: RespuestasTienda = {}): Promise<void> {
  for (let ronda = 0; ronda < 4; ronda++) {
    await tick();
    const pendientes = http.match(() => true);
    if (!pendientes.length) break;
    for (const r of pendientes) {
      const url = r.request.urlWithParams;
      if (url === `${API}/config`) r.flush(ok(configApi));
      else if (url === `${API}/productos`) r.flush(ok(d.productos ?? [camisaApi, llaveroApi]));
      else if (url === `${API}/pedidos/mios` || url === `${API}/admin/pedidos`) r.flush(ok(d.pedidos ?? []));
      else if (url === `${API}/notificaciones`) r.flush(ok(d.avisos ?? []));
      else if (url.endsWith('/metodos-pago')) r.flush(ok(d.tarjetas ?? [tarjetaApi, { ...tarjetaApi, id: 'pp', type: 'paypal' }]));
      else if (url.endsWith('/wallet/balance')) r.flush(ok(d.saldo ?? 100));
      else if (url.endsWith('/profile')) r.flush(ok({ phone: d.telefono ?? '+506 8888-7777' }));
      else r.flush(ok(null));
    }
  }
}
