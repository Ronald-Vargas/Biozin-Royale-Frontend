import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { API, ok, pedidoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreAdminService } from '../../store-admin.service';
import { AdminStorePaymentReviewComponent } from './admin-store-payment-review.component';

describe('AdminStorePaymentReviewComponent', () => {
  let fixture: ComponentFixture<AdminStorePaymentReviewComponent>;
  let http: HttpTestingController;
  let ui: StoreAdminService;
  let store: StoreService;

  beforeEach(async () => {
    localStorage.removeItem('store_admin_avisos_leidos');
    await TestBed.configureTestingModule({
      imports: [AdminStorePaymentReviewComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreAdminService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    ui = TestBed.inject(StoreAdminService);
    store = TestBed.inject(StoreService);
    void store.iniciar(true);
    await responder(http, { pedidos: [pedidoApi()] });

    fixture = TestBed.createComponent(AdminStorePaymentReviewComponent);
    fixture.componentRef.setInput('pedido', store.pedidos()[0]);
    fixture.detectChanges();
  });

  afterEach(() => {
    store.detener();
    http.verify();
  });

  it('confirmar el pago llama a la API y actualiza el pedido con la respuesta', async () => {
    const accion = fixture.componentInstance.confirmar(store.pedidos()[0]);
    const req = http.expectOne(`${API}/admin/pedidos/o-1/confirmar-pago`);
    expect(req.request.method).toBe('POST');
    req.flush(ok(pedidoApi({ paymentStatus: 'confirmed', fulfillmentPhase: 1 })));
    await accion;

    expect(store.pedidos()[0].estadoPago).toBe('confirmado');
    expect(store.pedidos()[0].fase).toBe(1);
    expect(ui.aviso()).toContain('confirmado');
  });

  it('rechazar pide confirmación y solo entonces llama a la API', async () => {
    fixture.componentInstance.pedirRechazo(store.pedidos()[0]);
    expect(ui.dialogo()?.titulo).toContain('BR-10241');
    http.expectNone(`${API}/admin/pedidos/o-1/rechazar-pago`);

    ui.aceptarDialogo();
    const req = http.expectOne(`${API}/admin/pedidos/o-1/rechazar-pago`);
    req.flush(ok(pedidoApi({ paymentStatus: 'rejected', isCancelled: true })));
    await responder(http);   // se recarga el catálogo: las unidades volvieron al inventario

    expect(store.pedidos()[0].cancelado).toBeTrue();
    expect(store.pedidos()[0].estadoPago).toBe('rechazado');
  });
});
