import { TestBed } from '@angular/core/testing';
import { StoreToastComponent } from './store-toast.component';

describe('StoreToastComponent', () => {
  it('muestra el texto y solo ofrece el botón cuando tiene etiqueta', () => {
    const f = TestBed.createComponent(StoreToastComponent);
    f.componentRef.setInput('text', 'Camiseta añadida al carrito.');
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.textContent).toContain('Camiseta añadida al carrito.');
    expect(el.querySelector('button')).toBeNull();

    f.componentRef.setInput('actionLabel', 'Ver carrito');
    f.detectChanges();
    let pulsado = 0;
    f.componentInstance.action.subscribe(() => pulsado++);
    (el.querySelector('button') as HTMLElement).click();
    expect(pulsado).toBe(1);
  });
});
