import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { pedidoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreAdminService } from '../../store-admin.service';
import { AdminStoreOrderSheetComponent } from './admin-store-order-sheet.component';

describe('AdminStoreOrderSheetComponent', () => {
  let fixture: ComponentFixture<AdminStoreOrderSheetComponent>;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;

  async function mostrar(extra: object) {
    const store = TestBed.inject(StoreService);
    void store.iniciar(true);
    await responder(http, { pedidos: [pedidoApi(extra)] });
    TestBed.inject(StoreAdminService).pedidoNo.set('BR-10241');
    fixture.detectChanges();
  }

  beforeEach(async () => {
    localStorage.removeItem('store_admin_avisos_leidos');
    await TestBed.configureTestingModule({
      imports: [AdminStoreOrderSheetComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreAdminService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminStoreOrderSheetComponent);
  });

  afterEach(() => {
    TestBed.inject(StoreService).detener();
    http.verify();
  });

  const paneles = () => ({
    pago: !!el().querySelector('app-admin-store-payment-review'),
    prep: !!el().querySelector('app-admin-store-prep-panel'),
    envio: !!el().querySelector('app-admin-store-shipping-panel'),
    entrega: !!el().querySelector('app-admin-store-delivery-panel'),
  });

  it('pago por verificar: muestra el panel de pago con la tarjeta usada', async () => {
    await mostrar({});
    expect(paneles()).toEqual({ pago: true, prep: false, envio: false, entrega: false });
    expect(el().textContent).toContain('Visa •••• 4242');
  });

  it('muestra el panel de la etapa en la que está el pedido', async () => {
    await mostrar({ paymentStatus: 'confirmed', fulfillmentPhase: 2 });
    expect(paneles()).toEqual({ pago: false, prep: true, envio: false, entrega: false });

    await mostrar({ paymentStatus: 'confirmed', fulfillmentPhase: 4, trackingNumber: 'CR-48103321', carrierName: 'Correos de Costa Rica' });
    expect(paneles()).toEqual({ pago: false, prep: false, envio: true, entrega: false });

    await mostrar({ paymentStatus: 'confirmed', fulfillmentPhase: 5 });
    expect(paneles()).toEqual({ pago: false, prep: false, envio: false, entrega: true });
  });

  it('un pedido cancelado no muestra paneles ni ofrece cancelar', async () => {
    await mostrar({ isCancelled: true, paymentStatus: 'rejected' });
    expect(paneles()).toEqual({ pago: false, prep: false, envio: false, entrega: false });
    expect(el().textContent).toContain('Cancelado');
    expect(Array.from(el().querySelectorAll('button')).some(b => b.textContent?.includes('Cancelar pedido'))).toBeFalse();
  });

  it('la bitácora lista los eventos del pedido', async () => {
    await mostrar({});
    expect(el().querySelector('app-admin-store-order-log')?.textContent).toContain('Pedido creado');
  });
});
