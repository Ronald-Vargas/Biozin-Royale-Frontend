import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { API, BAD_REQUEST, fallo, ok, pedidoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreNavService } from '../../store-nav.service';
import { StoreOrderTrackingComponent } from './store-order-tracking.component';

describe('StoreOrderTrackingComponent', () => {
  let fixture: ComponentFixture<StoreOrderTrackingComponent>;
  let component: StoreOrderTrackingComponent;
  let http: HttpTestingController;
  let store: StoreService;
  let nav: StoreNavService;
  const el = () => fixture.nativeElement as HTMLElement;

  function mostrar(extra: object) {
    store.pedidos.set([store['aPedido'](pedidoApi(extra) as never)]);
    nav.pedidoNo.set('BR-10241');
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreOrderTrackingComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreNavService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(StoreService);
    nav = TestBed.inject(StoreNavService);
    fixture = TestBed.createComponent(StoreOrderTrackingComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => http.verify());

  it('el código de entrega solo se muestra con el pedido en reparto', () => {
    mostrar({ fulfillmentPhase: 4 });
    expect(el().querySelector('.codigo')).toBeNull();

    mostrar({ fulfillmentPhase: 5, deliveryCode: '5190' });
    expect(Array.from(el().querySelectorAll('.codigo span')).map(s => s.textContent?.trim()).join('')).toBe('5190');

    mostrar({ fulfillmentPhase: 5, deliveryCode: '5190', hasOpenIncident: true });
    expect(el().querySelector('.codigo')).toBeNull();
  });

  it('arma la línea de tiempo con las etapas alcanzadas', () => {
    mostrar({ fulfillmentPhase: 2, paymentStatus: 'confirmed' });
    const items = component.lineaTiempo();
    expect(items.filter(i => i.clase === 'now').length).toBe(1);
    expect(items.find(i => i.clase === 'now')?.titulo).toBe('En preparación');
    expect(items.filter(i => i.clase === 'off').length).toBe(4);   // faltan 4 etapas
    expect(el().querySelectorAll('.vi').length).toBe(items.length);
  });

  it('un pedido cancelado lo indica y no ofrece cancelar de nuevo', () => {
    mostrar({ isCancelled: true, paymentStatus: 'rejected' });
    expect(el().querySelector('h2')?.textContent).toContain('Pedido cancelado');
    expect(component.puedeCancelar(component.pedido()!)).toBeFalse();
  });

  it('ofrece cancelar y cambiar dirección solo hasta que se empaca', () => {
    mostrar({ fulfillmentPhase: 1, paymentStatus: 'confirmed' });
    const p = component.pedido()!;
    expect(component.puedeCancelar(p)).toBeTrue();
    expect(component.puedeCambiarDireccion(p)).toBeTrue();

    mostrar({ fulfillmentPhase: 3, paymentStatus: 'confirmed' });
    expect(component.puedeCancelar(component.pedido()!)).toBeFalse();
    expect(component.puedeCambiarDireccion(component.pedido()!)).toBeFalse();
  });

  it('cancelar pide confirmación y llama a la API solo al aceptar', async () => {
    mostrar({ fulfillmentPhase: 1, paymentStatus: 'confirmed' });
    component.pedirCancelar(component.pedido()!);
    expect(nav.dialogo()?.titulo).toContain('BR-10241');
    http.expectNone(`${API}/pedidos/o-1/cancelar`);

    nav.aceptarDialogo();
    const req = http.expectOne(`${API}/pedidos/o-1/cancelar`);
    expect(req.request.method).toBe('POST');
    req.flush(ok(pedidoApi({ isCancelled: true, paymentStatus: 'refunded', fulfillmentPhase: 1 })));
    await responder(http);   // tras cancelar se recargan avisos, catálogo y saldo

    expect(store.pedidos()[0].cancelado).toBeTrue();
    expect(nav.aviso()?.texto).toContain('cancelado');
  });

  it('calificar muestra el error del servidor si falla', async () => {
    mostrar({ fulfillmentPhase: 6, paymentStatus: 'confirmed' });
    const accion = component.calificar(component.pedido()!, 5);
    http.expectOne(`${API}/pedidos/o-1/calificar`).flush(fallo('Solo puedes calificar una vez un pedido entregado.'), BAD_REQUEST);
    await accion;
    expect(nav.aviso()?.texto).toContain('calificar una vez');
  });

  it('la incidencia muestra el motivo real, no un texto genérico', () => {
    mostrar({
      fulfillmentPhase: 5, hasOpenIncident: true,
      events: [{ id: 'e-1', type: 'incident', phase: null, message: 'Intento fallido · Dirección incorrecta', actorName: 'Admin', actorRole: 'admin', createdAt: '2026-11-10T16:00:00Z' }],
    });
    expect(el().querySelector('.alerta .muted')?.textContent).toContain('Dirección incorrecta');
  });

  it('se puede cambiar la fecha de entrega en reparto sin que haya una incidencia', () => {
    mostrar({ fulfillmentPhase: 5 });
    expect(component.puedeReprogramar(component.pedido()!)).toBeTrue();
    const enlaces = Array.from(el().querySelectorAll('.fila-enlaces .enlace')).map(b => b.textContent?.trim());
    expect(enlaces).toContain('Cambiar fecha de entrega');

    mostrar({ fulfillmentPhase: 5, hasOpenIncident: true });
    expect(component.puedeReprogramar(component.pedido()!)).toBeFalse();   // ya tiene su propia tarjeta de incidencia

    mostrar({ fulfillmentPhase: 4 });
    expect(component.puedeReprogramar(component.pedido()!)).toBeFalse();   // todavía no va en reparto
  });

  it('pedir cambio o devolución abre la hoja de solicitud', () => {
    mostrar({ fulfillmentPhase: 6, paymentStatus: 'confirmed' });
    component.abrirSolicitud(component.pedido()!);
    expect(nav.hoja()).toEqual({ tipo: 'solicitud', id: 'BR-10241' });
  });

  it('muestra las solicitudes ya pedidas con su estado', () => {
    mostrar({
      fulfillmentPhase: 6, paymentStatus: 'confirmed',
      returns: [{
        id: 's-1', orderItemId: 'i-1', productName: 'Camiseta Royale', size: 'M', quantity: 1,
        requestType: 'refund', reason: 'No es mi talla', detail: '', exchangeSize: null, status: 'rejected',
        resolutionNote: 'Pasó el plazo de cambio', resolvedByName: 'Admin', resolvedAt: '2026-11-10T16:00:00Z', createdAt: '2026-11-09T16:00:00Z',
      }],
    });
    const texto = el().textContent ?? '';
    expect(texto).toContain('Devolución');
    expect(texto).toContain('Rechazada');
    expect(texto).toContain('Pasó el plazo de cambio');
  });
});
