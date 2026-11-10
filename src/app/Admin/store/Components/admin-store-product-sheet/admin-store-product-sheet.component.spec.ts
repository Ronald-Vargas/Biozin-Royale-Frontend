import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { API, ok, productoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreAdminService } from '../../store-admin.service';
import { AdminStoreProductSheetComponent } from './admin-store-product-sheet.component';

describe('AdminStoreProductSheetComponent', () => {
  let http: HttpTestingController;
  let ui: StoreAdminService;
  let store: StoreService;

  async function abrir(): Promise<ComponentFixture<AdminStoreProductSheetComponent>> {
    const fixture = TestBed.createComponent(AdminStoreProductSheetComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    localStorage.removeItem('store_admin_avisos_leidos');
    await TestBed.configureTestingModule({
      imports: [AdminStoreProductSheetComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreAdminService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    ui = TestBed.inject(StoreAdminService);
    store = TestBed.inject(StoreService);
    void store.iniciar(true);
    await responder(http, { productos: [productoApi('a', 8), productoApi('t', 6, { requiresSize: true, variants: [{ id: 'v1', size: 'M', stock: 6 }] })] });
  });

  afterEach(() => {
    store.detener();
    http.verify();
  });

  it('valida el formulario antes de llamar a la API', async () => {
    ui.nuevoProducto();
    const f = await abrir();
    const c = f.componentInstance;
    c.form.nombre = 'Producto prueba';
    c.form.precio = '0';
    c.form.stock = '3';
    await c.guardar();
    expect(c.error()).toContain('precio');
    http.expectNone(`${API}/admin/productos`);

    c.form.precio = '10';
    c.form.stock = '-1';
    await c.guardar();
    expect(c.error()).toContain('stock');
  });

  it('crea un producto con la API y lo agrega al catálogo', async () => {
    ui.nuevoProducto();
    const f = await abrir();
    const c = f.componentInstance;
    c.form.nombre = 'Producto prueba';
    c.form.precio = '10';
    c.form.stock = '3';
    const accion = c.guardar();

    const req = http.expectOne(`${API}/admin/productos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({ name: 'Producto prueba', price: 10, stock: 3 }));
    req.flush(ok(productoApi('nuevo', 3, { name: 'Producto prueba' })));
    await accion;

    expect(store.productos().length).toBe(3);
    expect(ui.aviso()).toContain('creado');
    expect(c.error()).toBe('');
  });

  it('al editar carga los datos del producto y guarda con PUT', async () => {
    ui.editarProducto('a');
    const f = await abrir();
    const c = f.componentInstance;
    expect(c.form.nombre).toBe('Producto a');
    expect(c.form.precio).toBe('10');

    c.form.precio = '12';
    const accion = c.guardar();
    const req = http.expectOne(`${API}/admin/productos/a`);
    expect(req.request.method).toBe('PUT');
    req.flush(ok(productoApi('a', 8, { price: 12 })));
    await accion;
    expect(store.producto('a')!.precio).toBe(12);
  });

  it('en productos con talla no pide el stock total (se ajusta por talla)', async () => {
    ui.editarProducto('t');
    const f = await abrir();
    expect(f.componentInstance.tieneTallas()).toBeTrue();
    expect((f.nativeElement as HTMLElement).textContent).toContain('se ajusta por talla');

    const accion = f.componentInstance.guardar();
    const req = http.expectOne(`${API}/admin/productos/t`);
    expect(req.request.body.stock).toBeNull();
    req.flush(ok(productoApi('t', 6)));
    await accion;
  });
});
