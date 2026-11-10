import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { pedidoApi, productoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreComponent } from './store.component';

describe('StoreComponent (admin)', () => {
  let fixture: ComponentFixture<StoreComponent>;
  let component: StoreComponent;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    localStorage.removeItem('store_admin_avisos_leidos');
    await TestBed.configureTestingModule({
      imports: [StoreComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await responder(http, { pedidos: [pedidoApi()], productos: [productoApi('a', 8), productoApi('b', 3)] });
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('abre en el resumen con los datos de la API', () => {
    expect(el().querySelector('app-admin-store-summary')).toBeTruthy();
    expect(component.ui.pedidos().length).toBe(1);
    expect(component.ui.store.productos().length).toBe(2);
    expect(el().querySelector('app-admin-store-order-list')?.textContent).toContain('BR-10241');
  });

  it('cada sección monta su propio componente', () => {
    const ir = (k: 'log' | 'ord' | 'prods' | 'inv') => { component.ui.irSeccion(k); fixture.detectChanges(); };

    ir('log');
    expect(el().querySelector('app-admin-store-logistics')).toBeTruthy();
    expect(el().querySelector('app-admin-store-summary')).toBeNull();
    ir('ord');
    expect(el().querySelector('app-admin-store-orders')).toBeTruthy();
    ir('prods');
    expect(el().querySelector('app-admin-store-products')).toBeTruthy();
    ir('inv');
    expect(el().querySelector('app-admin-store-inventory')).toBeTruthy();
  });

  it('un pedido sin confirmar aparece en "Por verificar pago" de Logística', () => {
    component.ui.irSeccion('log');
    fixture.detectChanges();
    expect(el().textContent).toContain('Por verificar pago');
    expect(component.ui.cuenta()['Por verificar pago']).toBe(1);
  });

  it('al tocar un pedido abre su hoja con el panel de pago', () => {
    component.ui.abrirPedido('BR-10241');
    fixture.detectChanges();
    expect(el().querySelector('app-store-sheet app-admin-store-order-sheet')).toBeTruthy();
    expect(el().querySelector('app-admin-store-payment-review')).toBeTruthy();

    component.ui.cerrarHoja();
    fixture.detectChanges();
    expect(el().querySelector('app-store-sheet')).toBeNull();
  });
});
