import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { API, BAD_REQUEST, fallo, ok, productoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreAdminService } from '../../store-admin.service';
import { AdminStoreInventoryComponent } from './admin-store-inventory.component';

describe('AdminStoreInventoryComponent', () => {
  let fixture: ComponentFixture<AdminStoreInventoryComponent>;
  let component: AdminStoreInventoryComponent;
  let http: HttpTestingController;
  let ui: StoreAdminService;
  let store: StoreService;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    localStorage.removeItem('store_admin_avisos_leidos');
    await TestBed.configureTestingModule({
      imports: [AdminStoreInventoryComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreAdminService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    ui = TestBed.inject(StoreAdminService);
    store = TestBed.inject(StoreService);
    void store.iniciar(true);
    await responder(http, {
      productos: [
        productoApi('a', 8),
        productoApi('b', 3),
        productoApi('t', 6, { requiresSize: true, variants: [{ id: 'v1', size: 'M', stock: 4 }, { id: 'v2', size: 'L', stock: 2 }] }),
      ],
    });
    fixture = TestBed.createComponent(AdminStoreInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    store.detener();
    http.verify();
  });

  it('resume unidades, valor y stock bajo', () => {
    expect(ui.unidades()).toBe(17);
    expect(ui.valorInventario()).toBe(170);
    expect(ui.stockBajo().map(p => p.id)).toEqual(['b']);
  });

  it('el filtro de stock bajo deja solo esos productos', () => {
    ui.soloBajo.set(true);
    fixture.detectChanges();
    expect(el().querySelectorAll('.item').length).toBe(1);
    expect(el().querySelector('.item')?.textContent).toContain('Producto b');
  });

  it('ajusta el stock por la API y refleja el resultado', async () => {
    const accion = component.ajustar('a', 10);
    const req = http.expectOne(`${API}/admin/productos/a/stock`);
    expect(req.request.body).toEqual({ delta: 10, size: null });
    req.flush(ok(productoApi('a', 18)));
    await accion;
    expect(store.producto('a')!.stock).toBe(18);
  });

  it('en prendas con talla ajusta talla por talla', async () => {
    fixture.detectChanges();
    expect(el().querySelectorAll('.talla-stock').length).toBe(2);

    const accion = component.ajustar('t', -1, 'M');
    const req = http.expectOne(`${API}/admin/productos/t/stock`);
    expect(req.request.body).toEqual({ delta: -1, size: 'M' });
    req.flush(ok(productoApi('t', 5, { requiresSize: true, variants: [{ id: 'v1', size: 'M', stock: 3 }, { id: 'v2', size: 'L', stock: 2 }] })));
    await accion;
    expect(store.producto('t')!.tallas.find(x => x.talla === 'M')!.stock).toBe(3);
  });

  it('si el servidor rechaza el ajuste (stock negativo) avisa y no cambia nada', async () => {
    const accion = component.ajustar('b', -5);
    http.expectOne(`${API}/admin/productos/b/stock`).flush(fallo('No se pudo ajustar: revisa la talla y que el stock no quede negativo.'), BAD_REQUEST);
    await accion;
    expect(ui.aviso()).toContain('stock no quede negativo');
    expect(store.producto('b')!.stock).toBe(3);
  });
});
