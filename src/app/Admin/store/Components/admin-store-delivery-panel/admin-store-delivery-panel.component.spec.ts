import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { API, BAD_REQUEST, fallo, ok, pedidoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreAdminService } from '../../store-admin.service';
import { AdminStoreDeliveryPanelComponent } from './admin-store-delivery-panel.component';

describe('AdminStoreDeliveryPanelComponent', () => {
  let fixture: ComponentFixture<AdminStoreDeliveryPanelComponent>;
  let component: AdminStoreDeliveryPanelComponent;
  let http: HttpTestingController;
  let ui: StoreAdminService;
  let store: StoreService;
  const enReparto = { paymentStatus: 'confirmed', fulfillmentPhase: 5 };

  beforeEach(async () => {
    localStorage.removeItem('store_admin_avisos_leidos');
    await TestBed.configureTestingModule({
      imports: [AdminStoreDeliveryPanelComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreAdminService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    ui = TestBed.inject(StoreAdminService);
    store = TestBed.inject(StoreService);
    void store.iniciar(true);
    await responder(http, { pedidos: [pedidoApi(enReparto)] });

    fixture = TestBed.createComponent(AdminStoreDeliveryPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pedido', store.pedidos()[0]);
    fixture.detectChanges();
  });

  afterEach(() => {
    store.detener();
    http.verify();
  });

  it('el admin nunca recibe el código de entrega del cliente', () => {
    expect(store.pedidos()[0].codigo).toBe('');
  });

  it('un código incorrecto muestra el mensaje del servidor y conserva lo escrito', async () => {
    component.codigoEntrada = '0000';
    const accion = component.confirmarEntrega(store.pedidos()[0]);
    http.expectOne(`${API}/admin/pedidos/o-1/entregar`).flush(fallo('El código de entrega no coincide.'), BAD_REQUEST);
    await accion;

    expect(ui.errorLog()).toContain('código');
    expect(store.pedidos()[0].fase).toBe(5);
    expect(component.codigoEntrada).toBe('0000');
  });

  it('con el código correcto cierra la entrega y limpia el campo', async () => {
    component.codigoEntrada = '5190';
    const accion = component.confirmarEntrega(store.pedidos()[0]);
    const req = http.expectOne(`${API}/admin/pedidos/o-1/entregar`);
    expect(req.request.body).toEqual({ code: '5190' });
    req.flush(ok(pedidoApi({ ...enReparto, fulfillmentPhase: 6 })));
    await accion;

    expect(store.pedidos()[0].fase).toBe(6);
    expect(component.codigoEntrada).toBe('');
    expect(ui.errorLog()).toBe('');
  });

  it('registra una incidencia con el motivo elegido', async () => {
    component.motivo = 'Dirección incorrecta';
    const accion = component.registrarIncidencia(store.pedidos()[0]);
    const req = http.expectOne(`${API}/admin/pedidos/o-1/incidencia`);
    expect(req.request.body).toEqual({ reason: 'Dirección incorrecta' });
    req.flush(ok(pedidoApi({ ...enReparto, hasOpenIncident: true })));
    await accion;

    expect(store.pedidos()[0].incidenciaAbierta).toBeTrue();
  });
});
