import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreService } from 'src/app/Core/Services/store.service';
import { Producto } from 'src/app/Core/Models/store.models';
import { StoreCartService } from './store-cart.service';
import { StoreNavService } from './store-nav.service';

const producto = (id: string, stock: number, tallas: { talla: string; stock: number }[] = []): Producto => ({
  id, nombre: `Producto ${id}`, categoria: 'Camisetas', precio: 10, arte: 'tee', variante: '', stock,
  etiqueta: '', descripcion: '', visible: true, requiereTalla: tallas.length > 0, tallas,
});

describe('StoreCartService', () => {
  let cart: StoreCartService;
  let nav: StoreNavService;
  let store: StoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), StoreNavService, StoreCartService],
    });
    cart = TestBed.inject(StoreCartService);
    nav = TestBed.inject(StoreNavService);
    store = TestBed.inject(StoreService);
    store.productos.set([
      producto('k', 2),
      producto('t', 3, [{ talla: 'M', stock: 2 }, { talla: 'L', stock: 0 }]),
    ]);
  });

  it('no deja pasar del stock disponible y avisa', () => {
    for (let i = 0; i < 4; i++) cart.anadir('k');
    expect(cart.cantidadDe('k')).toBe(2);
    expect(nav.aviso()?.texto).toContain('No hay más unidades');
  });

  it('con talla respeta el stock de esa talla', () => {
    cart.anadir('t', 'L');                       // agotada
    expect(cart.carrito().length).toBe(0);
    for (let i = 0; i < 3; i++) cart.anadir('t', 'M');
    expect(cart.carrito()[0].cantidad).toBe(2);
  });

  it('calcula el envío con el umbral del servidor', () => {
    cart.anadir('k');                            // $10: menos del mínimo, paga envío
    expect(cart.totales()).toEqual({ subtotal: 10, envio: 5, total: 15 });

    store.productos.set([producto('k', 20)]);
    store.config.set({ envioGratisDesde: 15, costoEnvio: 5, corte: '2:00 p. m.' });
    cart.cambiar(0, 1);                          // $20: ya no paga envío
    expect(cart.totales()).toEqual({ subtotal: 20, envio: 0, total: 20 });
  });

  it('quita la línea al bajar la cantidad a cero y se puede vaciar', () => {
    cart.anadir('k');
    cart.cambiar(0, -1);
    expect(cart.carrito().length).toBe(0);
    cart.anadir('k');
    cart.vaciar();
    expect(cart.cantidadCarrito()).toBe(0);
  });

  it('elige el botón de la tarjeta según el producto', () => {
    expect(cart.accion(cart.producto('k'))).toBe('anadir');
    expect(cart.accion(cart.producto('t'))).toBe('talla');
    cart.anadir('k');
    expect(cart.accion(cart.producto('k'))).toBe('cantidad');
    expect(cart.accion(producto('x', 0))).toBe('agotado');
  });
});
