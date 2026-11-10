import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { StoreNavService } from './store-nav.service';

describe('StoreNavService', () => {
  let nav: StoreNavService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreNavService],
    });
    nav = TestBed.inject(StoreNavService);
    router = TestBed.inject(Router);
  });

  it('retrocede por la pila de pantallas visitadas', () => {
    nav.ir('prod', 'a');
    nav.ir('prod', 'b');
    expect(nav.productoId()).toBe('b');

    nav.onBack();
    expect(nav.vista()).toBe('prod');
    expect(nav.productoId()).toBe('a');

    nav.onBack();
    expect(nav.vista()).toBe('home');
  });

  it('desde la portada sale al inicio de la app', () => {
    const navegar = spyOn(router, 'navigate').and.resolveTo(true);
    nav.onBack();
    expect(navegar).toHaveBeenCalledWith(['/home'], { replaceUrl: true });
  });

  it('al llegar a la portada o a la confirmación se vacía la pila', () => {
    nav.ir('cart');
    nav.ir('chk');
    nav.ir('ok');
    const navegar = spyOn(router, 'navigate').and.resolveTo(true);
    nav.onBack();   // no hay a dónde volver dentro de la tienda: de la confirmación se va a la portada
    expect(nav.vista()).toBe('home');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('cambiar de pantalla cierra la hoja abierta', () => {
    nav.hoja.set({ tipo: 'tallas', id: 'a' });
    nav.ir('cart');
    expect(nav.hoja()).toBeNull();
  });

  it('la confirmación ejecuta la acción solo al aceptar', () => {
    let hecho = 0;
    nav.pedirConfirmacion({ titulo: 't', texto: 'x', ok: 'Sí', conservar: 'No', accion: () => hecho++ });
    nav.cancelarDialogo();
    expect(hecho).toBe(0);
    expect(nav.dialogo()).toBeNull();

    nav.pedirConfirmacion({ titulo: 't', texto: 'x', ok: 'Sí', conservar: 'No', accion: () => hecho++ });
    nav.aceptarDialogo();
    expect(hecho).toBe(1);
  });
});
