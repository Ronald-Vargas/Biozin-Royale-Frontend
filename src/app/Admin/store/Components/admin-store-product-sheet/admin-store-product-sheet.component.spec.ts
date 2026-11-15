import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { API, ok, productoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreAdminService } from '../../store-admin.service';
import { AdminStoreProductSheetComponent } from './admin-store-product-sheet.component';

/** Genera un archivo de imagen real (vía canvas) para probar la subida sin tocar el disco. */
function archivoImagen(ancho: number, alto: number, tipo = 'image/png'): Promise<File> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    canvas.getContext('2d')!.fillRect(0, 0, ancho, alto);
    canvas.toBlob(blob => resolve(new File([blob!], 'foto.png', { type: tipo })), tipo);
  });
}
function eventoArchivo(archivo: File | null): Event {
  return { target: { files: archivo ? [archivo] : [], value: '' } } as unknown as Event;
}
/** elegirImagen() decodifica la imagen (asíncrono, real) antes de llamar a la API; le da tiempo. */
const decodificar = () => new Promise(r => setTimeout(r, 50));

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

  it('un producto nuevo (sin guardar) no ofrece subir foto todavía', async () => {
    ui.nuevoProducto();
    const f = await abrir();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Guarda el producto primero');
    expect(f.nativeElement.querySelector('input[type="file"]')).toBeNull();
  });

  it('tras crear un producto, la hoja queda abierta y ya se puede subir la foto', async () => {
    ui.nuevoProducto();
    const f = await abrir();
    const c = f.componentInstance;
    c.form.nombre = 'Producto prueba';
    c.form.precio = '10';
    c.form.stock = '3';
    const accion = c.guardar();
    http.expectOne(`${API}/admin/productos`).flush(ok(productoApi('nuevo', 3, { name: 'Producto prueba' })));
    await accion;

    expect(ui.hoja()).toBe('producto');   // no se cerró
    expect(c.form.id).toBe('nuevo');
    f.detectChanges();
    expect(f.nativeElement.querySelector('input[type="file"]')).not.toBeNull();
  });

  it('sube la foto y la refleja en el catálogo', async () => {
    ui.editarProducto('a');   // productoApi('a', 8): sin imagen (imagePath null)
    const f = await abrir();
    const c = f.componentInstance;
    expect(c.imagenActual()).toBe('');

    const archivo = await archivoImagen(10, 10);
    const accion = c.elegirImagen(eventoArchivo(archivo));
    await decodificar();
    const req = http.expectOne(`${API}/admin/productos/a/imagen`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(ok(productoApi('a', 8, { imagePath: 'a.png' })));
    await accion;

    expect(c.errorImagen()).toBe('');
    expect(c.avisoDimension()).toBe('');
    expect(ui.aviso()).toContain('actualizada');
    expect(store.producto('a')!.imagen).toContain('a.png');
  });

  it('avisa (sin bloquear) cuando la foto elegida no es cuadrada', async () => {
    ui.editarProducto('a');
    const f = await abrir();
    const c = f.componentInstance;

    const archivo = await archivoImagen(20, 10);
    const accion = c.elegirImagen(eventoArchivo(archivo));
    await decodificar();
    expect(c.avisoDimension()).toContain('no es cuadrada');

    http.expectOne(`${API}/admin/productos/a/imagen`).flush(ok(productoApi('a', 8, { imagePath: 'a.png' })));
    await accion;
  });

  it('rechaza un formato no soportado sin llamar a la API', async () => {
    ui.editarProducto('a');
    const f = await abrir();
    const c = f.componentInstance;

    const archivo = new File(['x'], 'foto.gif', { type: 'image/gif' });
    await c.elegirImagen(eventoArchivo(archivo));

    expect(c.errorImagen()).toContain('Formato no válido');
    http.expectNone(`${API}/admin/productos/a/imagen`);
  });

  it('rechaza una imagen demasiado pesada sin llamar a la API', async () => {
    ui.editarProducto('a');
    const f = await abrir();
    const c = f.componentInstance;

    const archivo = new File([new Uint8Array(4 * 1024 * 1024)], 'foto.png', { type: 'image/png' });
    await c.elegirImagen(eventoArchivo(archivo));

    expect(c.errorImagen()).toContain('3 MB');
    http.expectNone(`${API}/admin/productos/a/imagen`);
  });
});
