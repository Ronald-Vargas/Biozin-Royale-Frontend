import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminStoreComponent } from './store.component';

describe('AdminStoreComponent', () => {
  let fixture: ComponentFixture<AdminStoreComponent>;
  let component: AdminStoreComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStoreComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const stockDe = (id: string) => component.productos().find(p => p.id === id)!.stock;
  const estadoDe = (no: string) => component.pedidos().find(o => o.no === no)!.estado;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('avanza un pedido solo por los estados permitidos', () => {
    component.cambiarEstado('BR-10241', 'Entregado'); // salto no permitido
    expect(estadoDe('BR-10241')).toBe('Pendiente');

    component.cambiarEstado('BR-10241', 'Preparando');
    expect(estadoDe('BR-10241')).toBe('Preparando');
  });

  it('al cancelar un pedido las unidades vuelven al inventario', () => {
    const antes = stockDe('t1');
    component.cambiarEstado('BR-10241', 'Cancelado'); // incluye 2 camisetas t1
    expect(estadoDe('BR-10241')).toBe('Cancelado');
    expect(stockDe('t1')).toBe(antes + 2);
  });

  it('valida el formulario de producto antes de guardar', () => {
    component.nuevoProducto();
    component.formProd.nombre = 'Producto prueba';
    component.formProd.precio = '0';
    component.formProd.stock = '3';
    component.guardarProducto();
    expect(component.errorForm()).toContain('precio');
    expect(component.productos().length).toBe(24);

    component.formProd.precio = '10';
    component.guardarProducto();
    expect(component.errorForm()).toBe('');
    expect(component.productos().length).toBe(25);
  });

  it('no permite bloquear la propia cuenta', () => {
    const yo = component.usuarios().find(u => u.correo === component.yo)!;
    component.alternarBloqueo(yo);
    expect(component.dialogo()).toBeNull();
    expect(yo.activo).toBeTrue();
  });
});