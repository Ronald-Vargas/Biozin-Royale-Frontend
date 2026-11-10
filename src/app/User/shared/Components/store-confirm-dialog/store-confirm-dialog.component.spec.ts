import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreConfirmDialogComponent } from './store-confirm-dialog.component';

describe('StoreConfirmDialogComponent', () => {
  let fixture: ComponentFixture<StoreConfirmDialogComponent>;
  let component: StoreConfirmDialogComponent;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', '¿Cancelar el pedido?');
    fixture.componentRef.setInput('text', 'No se puede deshacer.');
    fixture.componentRef.setInput('ok', 'Cancelar pedido');
    fixture.componentRef.setInput('keep', 'Conservar');
    fixture.detectChanges();
  });

  it('muestra el título, el texto y los dos botones', () => {
    expect(el().querySelector('.titulo')!.textContent).toContain('¿Cancelar el pedido?');
    expect(el().querySelector('.texto')!.textContent).toContain('No se puede deshacer.');
    expect(el().querySelector('.btn-peligro')!.textContent).toContain('Cancelar pedido');
    expect(el().querySelector('.btn-fantasma')!.textContent).toContain('Conservar');
  });

  it('emite accepted al confirmar y cancelled al conservar', () => {
    let aceptado = 0;
    let cancelado = 0;
    component.accepted.subscribe(() => aceptado++);
    component.cancelled.subscribe(() => cancelado++);

    (el().querySelector('.btn-peligro') as HTMLElement).click();
    (el().querySelector('.btn-fantasma') as HTMLElement).click();
    expect(aceptado).toBe(1);
    expect(cancelado).toBe(1);
  });
});
