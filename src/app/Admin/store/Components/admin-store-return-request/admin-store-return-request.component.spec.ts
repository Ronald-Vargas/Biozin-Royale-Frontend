import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { API, ok, pedidoApi, responder, solicitudApi } from 'src/app/Core/Testing/store-testing';
import { SolicitudConPedido, StoreAdminService } from '../../store-admin.service';
import { AdminStoreReturnRequestComponent } from './admin-store-return-request.component';

describe('AdminStoreReturnRequestComponent', () => {
  let fixture: ComponentFixture<AdminStoreReturnRequestComponent>;
  let component: AdminStoreReturnRequestComponent;
  let http: HttpTestingController;
  let store: StoreService;
  const el = () => fixture.nativeElement as HTMLElement;

  async function montar(returnExtra: object = {}) {
    void store.iniciar(true);
    await responder(http, { pedidos: [pedidoApi({ fulfillmentPhase: 6, paymentStatus: 'confirmed', returns: [solicitudApi(returnExtra)] })] });

    const item: SolicitudConPedido = { pedido: store.pedidos()[0], solicitud: store.pedidos()[0].solicitudes[0] };
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    localStorage.removeItem('store_admin_avisos_leidos');
    await TestBed.configureTestingModule({
      imports: [AdminStoreReturnRequestComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreAdminService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(StoreService);
    fixture = TestBed.createComponent(AdminStoreReturnRequestComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    store.detener();
    http.verify();
  });

  it('una solicitud pendiente ofrece aprobar o rechazar', async () => {
    await montar();
    expect(el().textContent).toContain('Pendiente');
    expect(Array.from(el().querySelectorAll('button')).map(b => b.textContent?.trim())).toEqual(['Rechazar', 'Aprobar']);
  });

  it('una ya resuelta muestra la nota y quién la resolvió, sin botones', async () => {
    await montar({ status: 'approved', resolutionNote: 'Confirmado con el cliente', resolvedByName: 'Admin' });
    expect(el().textContent).toContain('Aprobada');
    expect(el().textContent).toContain('Confirmado con el cliente');
    expect(el().querySelector('button')).toBeNull();
  });

  it('aprobar manda la nota escrita y avisa al aprobarse', async () => {
    await montar();
    component.nota.set('Confirmado con el cliente');
    const accion = component.aprobar();

    const req = http.expectOne(`${API}/admin/solicitudes/s-1/aprobar`);
    expect(req.request.body).toEqual({ note: 'Confirmado con el cliente' });
    req.flush(ok(pedidoApi({ fulfillmentPhase: 6, paymentStatus: 'confirmed', returns: [solicitudApi({ status: 'approved' })] })));
    await responder(http);   // aprobar vuelve a pedir el catálogo
    await accion;

    expect(store.pedidos()[0].solicitudes[0].estado).toBe('aprobada');
  });

  it('rechazar también funciona sin escribir nota', async () => {
    await montar();
    const accion = component.rechazar();
    const req = http.expectOne(`${API}/admin/solicitudes/s-1/rechazar`);
    expect(req.request.body).toEqual({ note: null });
    req.flush(ok(pedidoApi({ fulfillmentPhase: 6, paymentStatus: 'confirmed', returns: [solicitudApi({ status: 'rejected' })] })));
    await accion;
    expect(store.pedidos()[0].solicitudes[0].estado).toBe('rechazada');
  });

  it('oculta el número de pedido cuando ya se está dentro de él', async () => {
    await montar();
    fixture.componentRef.setInput('mostrarPedido', false);
    fixture.detectChanges();
    expect(el().textContent).not.toContain('BR-10241');
  });
});
