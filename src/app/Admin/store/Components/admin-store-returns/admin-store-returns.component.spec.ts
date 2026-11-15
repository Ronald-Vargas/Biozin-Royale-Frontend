import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { pedidoApi, responder, solicitudApi } from 'src/app/Core/Testing/store-testing';
import { StoreAdminService } from '../../store-admin.service';
import { AdminStoreReturnsComponent } from './admin-store-returns.component';

describe('AdminStoreReturnsComponent', () => {
  let fixture: ComponentFixture<AdminStoreReturnsComponent>;
  let component: AdminStoreReturnsComponent;
  let http: HttpTestingController;
  let store: StoreService;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    localStorage.removeItem('store_admin_avisos_leidos');
    await TestBed.configureTestingModule({
      imports: [AdminStoreReturnsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreAdminService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(StoreService);
    fixture = TestBed.createComponent(AdminStoreReturnsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    store.detener();
    http.verify();
  });

  it('sin solicitudes, lo indica y no muestra nada que resolver', async () => {
    void store.iniciar(true);
    await responder(http, { pedidos: [pedidoApi()] });
    fixture.detectChanges();

    expect(el().textContent).toContain('No hay solicitudes esperando una respuesta');
    expect(el().querySelector('app-admin-store-return-request')).toBeNull();
  });

  it('cuenta pendientes y total, y lista cada pendiente', async () => {
    void store.iniciar(true);
    await responder(http, { pedidos: [pedidoApi({ returns: [
      solicitudApi({ id: 's-1' }),
      solicitudApi({ id: 's-2', status: 'rejected' }),
    ] })] });
    fixture.detectChanges();

    expect(component.ui.solicitudesPendientes().length).toBe(1);
    expect(component.ui.solicitudes().length).toBe(2);
    expect(el().querySelectorAll('app-admin-store-return-request').length).toBe(1);   // las resueltas están ocultas
  });

  it('las resueltas se ven solo al pedirlo', async () => {
    void store.iniciar(true);
    await responder(http, { pedidos: [pedidoApi({ returns: [solicitudApi({ status: 'approved' })] })] });
    fixture.detectChanges();
    expect(el().querySelector('app-admin-store-return-request')).toBeNull();

    component.verResueltas.set(true);
    fixture.detectChanges();
    expect(el().querySelectorAll('app-admin-store-return-request').length).toBe(1);
  });
});
