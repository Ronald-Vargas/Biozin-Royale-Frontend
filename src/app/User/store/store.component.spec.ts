import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreComponent } from './store.component';
import { StoreDemoService } from 'src/app/Core/Services/store-demo.service';

describe('StoreComponent (usuario)', () => {
  let fixture: ComponentFixture<StoreComponent>;
  let component: StoreComponent;
  let store: StoreDemoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(StoreDemoService);
    fixture.detectChanges();
  });

  const datosValidos = () => {
    component.datos.nombre = 'Ana Mora';
    component.datos.telefono = '88887777';
    component.datos.direccion = 'Calle 5, casa verde';
  };
  const stockDe = (id: string) => store.producto(id)!.stock;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('añade productos al carrito y respeta el stock', () => {
    for (let i = 0; i < 4; i++) component.anadir('k1'); // el llavero de 5 tiene 2 unidades
    expect(component.cantidadDe('k1')).toBe(2);
  });

  it('un pedido con SINPE queda con el pago por verificar y descuenta el stock', () => {
    component.anadir('t1', 'M');
    component.setMetodo('sinpe');
    datosValidos();
    component.confirmar();

    const pedido = component.pedidoActual()!;
    expect(component.vista()).toBe('ok');
    expect(pedido.estadoPago).toBe('pendiente');
    expect(pedido.fase).toBe(0);
    expect(stockDe('t1')).toBe(23);
    expect(component.carrito().length).toBe(0);
  });

  it('un pedido con billetera confirma el pago y descuenta el saldo', () => {
    component.anadir('t1', 'M');
    component.setMetodo('wallet');
    datosValidos();
    const antes = component.saldo();
    component.confirmar();

    const pedido = component.pedidoActual()!;
    expect(pedido.estadoPago).toBe('confirmado');
    expect(pedido.fase).toBe(1);
    expect(component.saldo()).toBe(antes - 33); // $28 + $5 de envío
  });

  it('rechaza el pago con billetera si el saldo no alcanza', () => {
    for (let i = 0; i < 5; i++) component.anadir('j3');
    for (let i = 0; i < 10; i++) component.anadir('h2', 'L');
    component.setMetodo('wallet');
    datosValidos();
    component.confirmar();

    expect(component.error()).toContain('saldo');
    expect(component.vista()).toBe('home');
  });

  it('el cliente cancela antes del empaque y las unidades vuelven al inventario', () => {
    const antes = stockDe('t1');
    const pedido = store.pedido('BR-10241')!; // pago por verificar, 2 camisetas
    expect(component.puedeCancelar(pedido)).toBeTrue();

    store.cancelar('BR-10241', 'Ana Mora', 'cliente');
    expect(store.pedido('BR-10241')!.cancelado).toBeTrue();
    expect(stockDe('t1')).toBe(antes + 2);
    expect(component.puedeCancelar(store.pedido('BR-10241')!)).toBeFalse();
  });

  it('tras un intento fallido, el cliente reprograma desde su seguimiento', () => {
    store.registrarIncidencia('BR-10230', 'Cliente no contesta', 'Repartidor');
    component.verPedido('BR-10230');
    expect(component.pedidoActual()!.incidenciaAbierta).toBeTrue();

    component.abrirFechas(component.pedidoActual()!);
    component.elegirVentana(store.ventanasDisponibles()[0]);
    const p = component.pedidoActual()!;
    expect(p.incidenciaAbierta).toBeFalse();
    expect(p.ventana).not.toBe('');
  });

  it('un pedido solo se entrega con el código correcto', () => {
    expect(store.confirmarEntrega('BR-10230', '0000', 'Repartidor')).toBeFalse();
    expect(store.pedido('BR-10230')!.fase).toBe(5);

    expect(store.confirmarEntrega('BR-10230', '5190', 'Repartidor')).toBeTrue();
    expect(store.pedido('BR-10230')!.fase).toBe(6);
  });

  it('un aviso nuevo llega al cliente y se cuenta como no leído', () => {
    const antes = component.noLeidas();
    store.iniciarPreparacion('BR-10238', 'Admin Royale'); // otro cliente: no cambia el conteo de Ana
    expect(component.noLeidas()).toBe(antes);

    store.notificar('cliente@biozin.com', 'Prueba', 'Aviso de prueba', 'BR-10230');
    expect(component.noLeidas()).toBe(antes + 1);
  });
});