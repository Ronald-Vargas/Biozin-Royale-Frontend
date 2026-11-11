import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { StoreService } from 'src/app/Core/Services/store.service';
import { API, BAD_REQUEST, camisaApi, fallo, llaveroApi, ok, pedidoApi, responder } from 'src/app/Core/Testing/store-testing';
import { StoreCartService } from '../../store-cart.service';
import { StoreCatalogService } from '../../store-catalog.service';
import { StoreNavService } from '../../store-nav.service';
import { StoreCheckoutComponent } from './store-checkout.component';

describe('StoreCheckoutComponent', () => {
  let fixture: ComponentFixture<StoreCheckoutComponent>;
  let component: StoreCheckoutComponent;
  let http: HttpTestingController;
  let cart: StoreCartService;
  let nav: StoreNavService;

  async function preparar(saldo = 100) {
    TestBed.inject(BalanceService).load();
    fixture.detectChanges();
    await responder(http, { saldo });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreCheckoutComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        StoreNavService, StoreCartService, StoreCatalogService,
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    cart = TestBed.inject(StoreCartService);
    nav = TestBed.inject(StoreNavService);
    // El catálogo ya está cargado: el servicio de la tienda guarda lo que trajo la API.
    const store = TestBed.inject(StoreService);
    store.productos.set([camisaApi, llaveroApi].map(p => store['aProducto'](p as never)));

    fixture = TestBed.createComponent(StoreCheckoutComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => http.verify());

  const datosValidos = () => {
    component.datos.telefono = '88887777';
    component.datos.provincia = 'Limón';
    component.datos.canton = 'Central';
    component.datos.distrito = 'Limón';
    component.datos.direccion = 'Calle 5, casa verde';
  };

  it('carga las tarjetas registradas (sin PayPal) y el teléfono del perfil', async () => {
    await preparar();
    expect(component.tarjetas().length).toBe(1);
    expect(component.tarjetaId()).toBe('card-1');
    expect(component.datos.telefono).toBe('88887777');
  });

  it('el pago con tarjeta exige elegir una tarjeta registrada, sin pedir los datos de nuevo', async () => {
    await preparar();
    cart.anadir('p-camisa', 'M');
    component.setMetodo('card');
    component.tarjetaId.set(null);
    datosValidos();
    await component.confirmar();

    expect(component.error()).toContain('tarjetas registradas');
    http.expectNone(`${API}/pedidos`);
  });

  it('un pedido con billetera se envía sin precios ni totales (los calcula el servidor)', async () => {
    await preparar();
    cart.anadir('p-camisa', 'M');
    component.setMetodo('wallet');
    datosValidos();
    const envio = component.confirmar();

    const req = http.expectOne(`${API}/pedidos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.paymentMethod).toBe('wallet');
    expect(req.request.body.items).toEqual([{ productId: 'p-camisa', size: 'M', quantity: 1 }]);
    expect(req.request.body.idempotencyKey).toBeTruthy();
    expect(JSON.stringify(req.request.body)).not.toMatch(/price|total|shipping|envio/i);
    req.flush(ok(pedidoApi({ paymentMethod: 'wallet', paymentStatus: 'confirmed', fulfillmentPhase: 1, orderNumber: 10242 })));
    await responder(http);   // tras comprar, la app vuelve a pedir catálogo y saldo
    await envio;

    expect(nav.vista()).toBe('ok');
    expect(nav.pedidoNo()).toBe('BR-10242');
    expect(cart.carrito().length).toBe(0);
  });

  it('un pedido con tarjeta envía el id de la tarjeta elegida', async () => {
    await preparar();
    cart.anadir('p-camisa', 'M');
    component.setMetodo('card');
    datosValidos();
    const envio = component.confirmar();

    const req = http.expectOne(`${API}/pedidos`);
    expect(req.request.body.paymentMethod).toBe('card');
    expect(req.request.body.paymentMethodId).toBe('card-1');
    req.flush(ok(pedidoApi()));
    await responder(http);
    await envio;

    expect(TestBed.inject(StoreService).pedidos()[0].tarjeta).toBe('Visa •••• 4242');
  });

  it('muestra el error del servidor si la compra falla y no avanza', async () => {
    await preparar();
    cart.anadir('p-camisa', 'M');
    datosValidos();
    const envio = component.confirmar();
    http.expectOne(`${API}/pedidos`).flush(fallo('No hay suficientes unidades de Camiseta Royale.'), BAD_REQUEST);
    await responder(http);
    await envio;

    expect(component.error()).toContain('No hay suficientes unidades');
    expect(nav.vista()).toBe('home');
    expect(cart.carrito().length).toBe(1);
  });

  it('con saldo insuficiente avisa sin llamar al servidor', async () => {
    await preparar(20);          // $28 + $5 de envío > $20
    cart.anadir('p-camisa', 'M');
    component.setMetodo('wallet');
    datosValidos();
    await component.confirmar();

    expect(component.error()).toContain('saldo');
    http.expectNone(`${API}/pedidos`);
  });

  it('valida teléfono, ubicación y señas antes de enviar', async () => {
    await preparar();
    cart.anadir('p-llavero');
    component.datos.telefono = '123';
    await component.confirmar();
    expect(component.error()).toContain('8 dígitos');

    component.datos.telefono = '88887777';
    await component.confirmar();
    expect(component.error()).toContain('provincia');

    component.datos.provincia = 'Limón';
    await component.confirmar();
    expect(component.error()).toContain('cantón');

    component.datos.canton = 'Central';
    await component.confirmar();
    expect(component.error()).toContain('distrito');

    component.datos.distrito = 'Limón';
    component.datos.direccion = 'ab';
    await component.confirmar();
    expect(component.error()).toContain('señas exactas');
  });
});
