import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StoreComponent } from './store.component';

describe('StoreComponent', () => {
  let fixture: ComponentFixture<StoreComponent>;
  let component: StoreComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const datosValidos = () => {
    component.datos.nombre = 'Ana Mora';
    component.datos.telefono = '88887777';
    component.datos.direccion = 'Calle 5, casa verde';
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('añade productos al carrito y respeta el stock', () => {
    for (let i = 0; i < 4; i++) component.anadir('k1'); // el llavero de 5 tiene 2 unidades
    expect(component.cantidadDe('k1')).toBe(2);
  });

  it('confirma un pedido con SINPE y descuenta el stock', () => {
    component.anadir('t1', 'M');
    component.setMetodo('sinpe');
    datosValidos();
    component.confirmar();

    expect(component.vista()).toBe('ok');
    expect(component.carrito().length).toBe(0);
    expect(component.pedidos().length).toBe(4);
    expect(component.producto('t1').stock).toBe(23);
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
});