import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StoreComponent } from './store.component';
import { StoreDemoService } from 'src/app/Core/Services/store-demo.service';

describe('StoreComponent', () => {
  let fixture: ComponentFixture<StoreComponent>;
  let component: StoreComponent;
  let store: StoreDemoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(StoreDemoService);
    fixture.detectChanges();
  });

  const pedido = (no: string) => store.pedido(no)!;
  const stockDe = (id: string) => store.producto(id)!.stock;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lleva un pedido de punta a punta: pago, preparación, despacho, incidencia y entrega con código', () => {
    const no = 'BR-10241'; // SINPE por verificar, 2 artículos
    component.confirmarPago(pedido(no));
    expect(pedido(no).estadoPago).toBe('confirmado');
    expect(pedido(no).fase).toBe(1);

    component.iniciarPreparacion(pedido(no));
    expect(pedido(no).fase).toBe(2);

    component.alternarPick(pedido(no), 0);
    expect(component.pickingCompleto(pedido(no))).toBeFalse(); // falta un artículo
    component.alternarPick(pedido(no), 1);
    expect(component.pickingCompleto(pedido(no))).toBeTrue();
    component.marcarEmpacado(pedido(no));
    expect(pedido(no).fase).toBe(3);
    expect(pedido(no).paquete).toContain('Caja M');

    component.despachar(pedido(no)); // sin transportista elegido
    expect(component.errorLog()).toContain('transportista');
    component.elegirTransportista('correos');
    component.despachar(pedido(no));
    expect(pedido(no).fase).toBe(4);
    expect(pedido(no).guia.startsWith('CR-')).toBeTrue();

    component.iniciarReparto(pedido(no));
    expect(pedido(no).fase).toBe(5);

    component.registrarIncidencia(pedido(no));
    expect(pedido(no).incidenciaAbierta).toBeTrue();
    component.reprogramarPorCliente(pedido(no));
    expect(pedido(no).incidenciaAbierta).toBeFalse();
    expect(pedido(no).ventana).not.toBe('');

    component.codigoEntrada = '0000';
    component.confirmarEntrega(pedido(no));
    expect(component.errorLog()).toContain('código');
    expect(pedido(no).fase).toBe(5);

    component.codigoEntrada = pedido(no).codigo;
    component.confirmarEntrega(pedido(no));
    expect(pedido(no).fase).toBe(6);
    expect(pedido(no).eventos.length).toBeGreaterThan(6); // todo queda en la bitácora
  });

  it('no deja saltarse etapas ni despachar a una zona sin cobertura', () => {
    expect(store.iniciarReparto('BR-10241', 'Admin Royale')).toBeFalse();
    expect(pedido('BR-10241').fase).toBe(0);

    store.confirmarPago('BR-10241', 'Admin Royale');
    store.iniciarPreparacion('BR-10241', 'Admin Royale');
    store.marcarEmpacado('BR-10241', 'Caja M · 0,9 kg', 'Admin Royale');
    expect(store.despachar('BR-10241', 'local', 'Admin Royale')).toBeFalse(); // Limón queda fuera de la GAM
    expect(pedido('BR-10241').fase).toBe(3);
  });

  it('rechazar un pago cancela el pedido y devuelve las unidades al inventario', () => {
    const antes = stockDe('t1');
    store.rechazarPago('BR-10241', 'Admin Royale');
    expect(pedido('BR-10241').cancelado).toBeTrue();
    expect(pedido('BR-10241').estadoPago).toBe('rechazado');
    expect(stockDe('t1')).toBe(antes + 2);
  });

  it('el admin cancela hasta que el pedido sale, y no después', () => {
    expect(component.puedeCancelar(pedido('BR-10241'))).toBeTrue();
    expect(component.puedeCancelar(pedido('BR-10230'))).toBeFalse(); // ya va en reparto
  });

  it('un pedido nuevo genera un aviso para el admin', () => {
    const antes = component.noLeidas();
    store.crearPedido({
      correo: 'cliente@biozin.com', cliente: 'Ana Mora', telefono: '88887777', metodoPago: 'sinpe', entrega: 'retiro',
      direccion: '', items: [{ id: 'r3', talla: null, cantidad: 1 }], envio: 0,
    });
    expect(component.noLeidas()).toBe(antes + 1);
  });

  it('valida el formulario de producto antes de guardar', () => {
    component.nuevoProducto();
    component.formProd.nombre = 'Producto prueba';
    component.formProd.precio = '0';
    component.formProd.stock = '3';
    component.guardarProducto();
    expect(component.errorForm()).toContain('precio');

    component.formProd.precio = '10';
    component.guardarProducto();
    expect(component.errorForm()).toBe('');
    expect(store.productos().length).toBe(25);
  });

  it('no permite bloquear la propia cuenta', () => {
    const yo = store.usuarios().find(u => u.correo === component.yo)!;
    component.alternarBloqueo(yo);
    expect(component.dialogo()).toBeNull();
    expect(yo.activo).toBeTrue();
  });
});