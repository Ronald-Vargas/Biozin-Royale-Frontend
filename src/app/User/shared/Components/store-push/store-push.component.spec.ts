import { TestBed } from '@angular/core/testing';
import { StorePushComponent } from './store-push.component';

describe('StorePushComponent', () => {
  it('muestra el aviso y emite opened al tocarlo', () => {
    const f = TestBed.createComponent(StorePushComponent);
    f.componentRef.setInput('title', 'Nuevo pedido BR-10243');
    f.componentRef.setInput('text', 'Luis Vargas · $33.00');
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.textContent).toContain('Nuevo pedido BR-10243');

    let abierto = 0;
    f.componentInstance.opened.subscribe(() => abierto++);
    (el.querySelector('button') as HTMLElement).click();
    expect(abierto).toBe(1);
  });
});
