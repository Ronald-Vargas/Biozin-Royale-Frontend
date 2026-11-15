import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API, BAD_REQUEST, fallo, ok, pedidoApi, responder, solicitudApi } from '../Testing/store-testing';
import { StoreService } from './store.service';

describe('StoreService', () => {
  let store: StoreService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('store_admin_avisos_leidos');
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    store = TestBed.inject(StoreService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    store.detener();
    http.verify();
  });

  it('traduce la respuesta de la API a los modelos de las pantallas', async () => {
    void store.iniciar(false);
    await responder(http, { pedidos: [pedidoApi({ deliveryCode: '5190', fulfillmentPhase: 5, paymentStatus: 'confirmed' })] });

    const p = store.pedidos()[0];
    expect(p.no).toBe('BR-10241');
    expect(p.estadoPago).toBe('confirmado');
    expect(p.metodoPago).toBe('card');
    expect(p.tarjeta).toBe('Visa •••• 4242');
    expect(p.direccion).toBe('Limón, Barrio Santa Rosa');
    expect(p.codigo).toBe('5190');
    expect(p.items[0]).toEqual({ id: 'p-camisa', itemId: 'i-1', nombre: 'Camiseta Royale', talla: 'M', cantidad: 1, precio: 28 });
    expect(p.eventos[0].tipo).toBe('fase');
    expect(p.eta).toContain('mié 11');   // 11 y 12 de noviembre de 2026
    expect(p.eta).not.toContain('Invalid');   // el servidor manda la fecha con hora pegada
    expect(store.config().maxIntentosEntrega).toBe(3);
    expect(p.intentosFallidos).toBe(0);
    expect(p.solicitudes).toEqual([]);

    const camisa = store.producto('p-camisa');
    expect(camisa?.imagen).toMatch(/\/storage\/v1\/object\/public\/store-products\/br-t1\.webp$/);
    expect(store.producto('p-llavero')?.imagen).toBe('');
  });

  it('un pedido sin código (vista del admin) queda con el código vacío', async () => {
    void store.iniciar(true);
    await responder(http, { pedidos: [pedidoApi({ deliveryCode: null })] });
    expect(store.pedidos()[0].codigo).toBe('');
  });

  it('el admin carga todos los pedidos y el cliente solo los suyos', async () => {
    void store.iniciar(true);
    await responder(http);
    store.detener();

    void store.iniciar(false);
    await responder(http);
    expect(true).toBeTrue();   // cada responder() falla si hubiera pedido una URL no prevista
  });

  it('devuelve el mensaje del servidor cuando una operación falla', async () => {
    void store.iniciar(false);
    await responder(http, { pedidos: [pedidoApi()] });

    const accion = store.cancelar('BR-10241');
    http.expectOne(`${API}/pedidos/o-1/cancelar`).flush(fallo('Este pedido ya no se puede cancelar.'), BAD_REQUEST);
    const r = await accion;
    expect(r.ok).toBeFalse();
    if (!r.ok) expect(r.error).toBe('Este pedido ya no se puede cancelar.');
  });

  it('traduce el límite de solicitudes y la falta de conexión', async () => {
    void store.iniciar(false);
    await responder(http, { pedidos: [pedidoApi()] });

    const limite = store.calificar('BR-10241', 5);
    http.expectOne(`${API}/pedidos/o-1/calificar`).flush(null, { status: 429, statusText: 'Too Many Requests' });
    const r1 = await limite;
    expect(!r1.ok && r1.error).toContain('Demasiados intentos');

    const sinRed = store.calificar('BR-10241', 5);
    http.expectOne(`${API}/pedidos/o-1/calificar`).error(new ProgressEvent('error'));
    const r2 = await sinRed;
    expect(!r2.ok && r2.error).toContain('No hay conexión');
  });

  it('un pedido que no existe no llama a la API', async () => {
    const r = await store.cancelar('BR-99999');
    expect(r.ok).toBeFalse();
    http.expectNone(() => true);
  });

  describe('avisos del admin (salen de lo que hacen los clientes)', () => {
    const nuevoPedido = pedidoApi({
      id: 'o-2', orderNumber: 10243,
      events: [{ id: 'e-9', type: 'phase', phase: 0, message: 'Pedido creado · Billetera', actorName: 'Luis Vargas', actorRole: 'user', createdAt: '2026-11-09T17:00:00Z' }],
    });

    it('los pedidos que ya existían al abrir no cuentan como avisos nuevos', async () => {
      void store.iniciar(true);
      await responder(http, { pedidos: [pedidoApi()] });
      expect(store.notificaciones().length).toBe(1);
      expect(store.notificaciones().every(n => n.leida)).toBeTrue();
    });

    it('un pedido nuevo genera un aviso sin leer, y se puede marcar como leído', async () => {
      void store.iniciar(true);
      await responder(http, { pedidos: [pedidoApi()] });

      store.pedidos.update(ps => [store['aPedido'](nuevoPedido as never), ...ps]);
      const nuevos = store.notificaciones().filter(n => !n.leida);
      expect(nuevos.length).toBe(1);
      expect(nuevos[0].titulo).toBe('Nuevo pedido BR-10243');

      store.marcarLeida(nuevos[0].id);
      expect(store.notificaciones().every(n => n.leida)).toBeTrue();
      expect(JSON.parse(localStorage.getItem('store_admin_avisos_leidos') ?? '[]')).toContain('e-9');
    });

    it('las acciones del propio admin no generan avisos', async () => {
      void store.iniciar(true);
      await responder(http, { pedidos: [pedidoApi({
        events: [
          { id: 'e-1', type: 'phase', phase: 0, message: 'Pedido creado', actorName: 'Ana', actorRole: 'user', createdAt: '2026-11-09T16:00:00Z' },
          { id: 'e-2', type: 'payment', phase: 1, message: 'Pago confirmado', actorName: 'Admin', actorRole: 'admin', createdAt: '2026-11-09T16:10:00Z' },
          { id: 'e-3', type: 'phase', phase: 2, message: 'Preparación iniciada', actorName: 'Sistema', actorRole: 'system', createdAt: '2026-11-09T16:20:00Z' },
        ],
      })] });
      expect(store.notificaciones().length).toBe(1);   // solo el pedido nuevo del cliente
    });

    it('una solicitud nueva del cliente avisa al admin; aprobarla o rechazarla (cosa suya) no', async () => {
      void store.iniciar(true);
      await responder(http, { pedidos: [pedidoApi({
        events: [
          { id: 'e-1', type: 'phase', phase: 0, message: 'Pedido creado', actorName: 'Ana', actorRole: 'user', createdAt: '2026-11-09T16:00:00Z' },
          { id: 'e-2', type: 'change', phase: null, message: 'Pidió devolución · 1× Camiseta Royale (M) · No es mi talla', actorName: 'Ana', actorRole: 'user', createdAt: '2026-11-10T16:00:00Z' },
          { id: 'e-3', type: 'change', phase: null, message: 'Devolución aprobada · $28.00 reembolsados a la billetera', actorName: 'Admin', actorRole: 'admin', createdAt: '2026-11-10T17:00:00Z' },
        ],
      })] });
      const avisos = store.notificaciones();   // también está el aviso del "Pedido creado" (e-1)
      expect(avisos.length).toBe(2);
      const solicitud = avisos.find(a => a.titulo === 'Solicitud nueva BR-10241');
      expect(solicitud?.texto).toContain('devolución');
    });
  });

  it('traduce las solicitudes de cambio/devolución del pedido', async () => {
    void store.iniciar(false);
    await responder(http, { pedidos: [pedidoApi({ returns: [solicitudApi(), solicitudApi({ id: 's-2', status: 'approved', requestType: 'exchange', exchangeSize: 'L' })] })] });

    const s = store.pedidos()[0].solicitudes;
    expect(s.length).toBe(2);
    expect(s[0]).toEqual({
      id: 's-1', itemId: 'i-1', producto: 'Camiseta Royale', talla: 'M', cantidad: 1, tipo: 'devolucion',
      motivo: 'No es mi talla', detalle: '', tallaNueva: null, estado: 'pendiente', notaResolucion: '', resueltoPor: '', resueltoEn: '',
      creadoEn: s[0].creadoEn, creadoTs: s[0].creadoTs,
    });
    expect(s[1].tipo).toBe('cambio');
    expect(s[1].estado).toBe('aprobada');
    expect(s[1].tallaNueva).toBe('L');
  });

  it('crea una solicitud de cambio/devolución', async () => {
    void store.iniciar(false);
    await responder(http, { pedidos: [pedidoApi()] });

    const envio = store.crearSolicitud('BR-10241', { itemId: 'i-1', tipo: 'devolucion', motivo: 'No es mi talla', detalle: 'Me quedó grande', cantidad: 1 });
    const req = http.expectOne(`${API}/pedidos/o-1/solicitudes`);
    expect(req.request.body).toEqual({
      orderItemId: 'i-1', requestType: 'refund', reason: 'No es mi talla', detail: 'Me quedó grande', quantity: 1, exchangeSize: null,
    });
    req.flush(ok(pedidoApi({ returns: [solicitudApi()] })));
    await responder(http);   // una acción del cliente vuelve a pedir sus avisos
    const r = await envio;
    expect(r.ok).toBeTrue();
  });

  it('el admin aprueba o rechaza una solicitud', async () => {
    void store.iniciar(true);
    await responder(http, { pedidos: [pedidoApi({ returns: [solicitudApi()] })] });

    const envio = store.aprobarSolicitud('s-1', 'Confirmado por el cliente');
    const req = http.expectOne(`${API}/admin/solicitudes/s-1/aprobar`);
    expect(req.request.body).toEqual({ note: 'Confirmado por el cliente' });
    req.flush(ok(pedidoApi({ returns: [solicitudApi({ status: 'approved' })] })));
    await responder(http);   // tras aprobar, vuelve a pedir el catálogo (el stock cambió)
    const r = await envio;
    expect(r.ok).toBeTrue();
    expect(store.pedidos()[0].solicitudes[0].estado).toBe('aprobada');
  });

  it('el catálogo y el pedido creado quedan en los signals', async () => {
    void store.iniciar(false);
    await responder(http, { pedidos: [] });

    const envio = store.crearPedido({
      metodoPago: 'wallet', telefono: '88887777', provincia: 'Limón', canton: 'Central', distrito: 'Limón',
      direccion: 'Calle 5, casa verde', items: [{ id: 'p-llavero', talla: null, cantidad: 1 }], claveOperacion: 'abc',
    });
    http.expectOne(`${API}/pedidos`).flush(ok(pedidoApi({ paymentMethod: 'wallet' })));
    await responder(http);
    const r = await envio;

    expect(r.ok).toBeTrue();
    expect(store.pedidos().length).toBe(1);
  });
});
