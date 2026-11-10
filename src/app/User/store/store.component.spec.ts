import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { responder, tick } from 'src/app/Core/Testing/store-testing';
import { StoreComponent } from './store.component';

describe('StoreComponent (usuario)', () => {
  let fixture: ComponentFixture<StoreComponent>;
  let component: StoreComponent;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await responder(http);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra la portada con los productos que trae la API', () => {
    expect(el().querySelector('app-store-home')).toBeTruthy();
    expect(el().querySelectorAll('.grid app-store-product-card').length).toBe(2);
    expect(component.store.productos().length).toBe(2);
  });

  it('cada vista monta su propia ventana', async () => {
    component.nav.ir('cart');
    fixture.detectChanges();
    expect(el().querySelector('app-store-cart')).toBeTruthy();
    expect(el().querySelector('app-store-home')).toBeNull();

    component.nav.ir('mine');
    fixture.detectChanges();
    expect(el().querySelector('app-store-my-orders')).toBeTruthy();
    await tick();
  });

  it('el ícono del carrito cuenta las unidades y la hoja de tallas se abre desde la tarjeta', () => {
    component.cart.anadir('p-llavero');
    fixture.detectChanges();
    expect(el().querySelector('[aria-label="Carrito"] .badge')?.textContent?.trim()).toBe('1');

    component.cart.abrirTallas('p-camisa');
    fixture.detectChanges();
    expect(el().querySelector('app-store-size-sheet')).toBeTruthy();
  });

  it('la confirmación se muestra y ejecuta la acción solo al aceptar', () => {
    let hecho = false;
    component.nav.pedirConfirmacion({ titulo: '¿Seguro?', texto: 'Texto', ok: 'Sí', conservar: 'No', accion: () => (hecho = true) });
    fixture.detectChanges();
    expect(el().querySelector('app-store-confirm-dialog .titulo')?.textContent).toContain('¿Seguro?');

    (el().querySelector('app-store-confirm-dialog .btn-peligro') as HTMLElement).click();
    expect(hecho).toBeTrue();
    fixture.detectChanges();
    expect(el().querySelector('app-store-confirm-dialog')).toBeNull();
  });
});
