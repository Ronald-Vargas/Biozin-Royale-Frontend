import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { API, ok, pedidoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreNavService } from '../../store-nav.service';
import { StoreReturnSheetComponent } from './store-return-sheet.component';

describe('StoreReturnSheetComponent', () => {
  let fixture: ComponentFixture<StoreReturnSheetComponent>;
  let component: StoreReturnSheetComponent;
  let http: HttpTestingController;
  let store: StoreService;
  let nav: StoreNavService;

  function montar(extra: object = {}) {
    store.pedidos.set([store['aPedido'](pedidoApi(extra) as never)]);
    fixture = TestBed.createComponent(StoreReturnSheetComponent);
    component = fixture.componentInstance;
    component.pedidoNo = 'BR-10241';
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreReturnSheetComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreNavService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(StoreService);
    nav = TestBed.inject(StoreNavService);
  });

  afterEach(() => http.verify());

  it('preselecciona el único artículo pendiente y permite cambio de talla si tiene talla', () => {
    montar({ fulfillmentPhase: 6, paymentStatus: 'confirmed' });
    expect(component.itemId()).toBe('i-1');
    expect(component.puedeCambiarTalla()).toBeTrue();
    expect(component.tallasDisponibles()).toEqual(['S', 'L', 'XL']);   // sin la M que ya tiene
  });

  it('un artículo sin talla solo ofrece devolución', () => {
    montar({
      fulfillmentPhase: 6, paymentStatus: 'confirmed',
      items: [{ id: 'i-2', productId: 'p-llavero', name: 'Llavero Ficha 5', size: null, quantity: 1, unitPrice: 8 }],
    });
    expect(component.puedeCambiarTalla()).toBeFalse();
  });

  it('exige elegir la talla nueva antes de enviar un cambio', async () => {
    montar({ fulfillmentPhase: 6, paymentStatus: 'confirmed' });
    component.elegirTipo('cambio');
    await component.enviar();
    expect(component.error()).toContain('talla');
    http.expectNone(() => true);
  });

  it('envía la solicitud y cierra la hoja al tener éxito', async () => {
    montar({ fulfillmentPhase: 6, paymentStatus: 'confirmed' });
    component.motivo.set('No es mi talla');
    component.detalle.set('Me quedó grande');
    const envio = component.enviar();

    const req = http.expectOne(`${API}/pedidos/o-1/solicitudes`);
    expect(req.request.body).toEqual({
      orderItemId: 'i-1', requestType: 'refund', reason: 'No es mi talla', detail: 'Me quedó grande', quantity: 1, exchangeSize: null,
    });
    req.flush(ok(pedidoApi({ fulfillmentPhase: 6, paymentStatus: 'confirmed' })));
    await responder(http);   // una acción del cliente vuelve a pedir sus avisos
    await envio;

    expect(nav.hoja()).toBeNull();
    expect(nav.aviso()?.texto).toContain('devolución');
  });

  it('sin artículos pendientes (ya se pidió para todos), lo indica', () => {
    montar({
      fulfillmentPhase: 6, paymentStatus: 'confirmed',
      returns: [{
        id: 's-1', orderItemId: 'i-1', productName: 'Camiseta Royale', size: 'M', quantity: 1,
        requestType: 'refund', reason: 'No es mi talla', detail: '', exchangeSize: null, status: 'pending',
        resolutionNote: null, resolvedByName: null, resolvedAt: null, createdAt: '2026-11-10T16:00:00Z',
      }],
    });
    expect(component.items().length).toBe(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ya pediste un cambio o devolución');
  });
});
