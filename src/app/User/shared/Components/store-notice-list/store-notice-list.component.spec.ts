import { TestBed } from '@angular/core/testing';
import { StoreNotificacion } from 'src/app/Core/Models/store.models';
import { StoreNoticeListComponent } from './store-notice-list.component';

const aviso = (id: string, leida: boolean): StoreNotificacion =>
  ({ id, titulo: `Aviso ${id}`, texto: 'Texto', fecha: 'lun 9 nov · 10:00', ts: 1, leida, pedidoNo: 'BR-10242' });

describe('StoreNoticeListComponent', () => {
  function crear(avisos: StoreNotificacion[], unread: number, limit?: number) {
    const f = TestBed.createComponent(StoreNoticeListComponent);
    f.componentRef.setInput('avisos', avisos);
    f.componentRef.setInput('unread', unread);
    if (limit) f.componentRef.setInput('limit', limit);
    f.detectChanges();
    return f;
  }

  it('limita la cantidad mostrada y marca los no leídos', () => {
    const f = crear([aviso('1', false), aviso('2', true), aviso('3', true)], 1, 2);
    const items = (f.nativeElement as HTMLElement).querySelectorAll('.aviso-item');
    expect(items.length).toBe(2);
    expect(items[0].classList).toContain('nuevo');
    expect(items[1].classList).not.toContain('nuevo');
  });

  it('solo ofrece marcar como leídos si hay avisos sin leer', () => {
    const f = crear([aviso('1', true)], 0);
    expect((f.nativeElement as HTMLElement).querySelector('.enlace')).toBeNull();
    f.componentRef.setInput('unread', 1);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).querySelector('.enlace')).toBeTruthy();
  });

  it('emite el aviso que se toca', () => {
    const f = crear([aviso('7', false)], 1);
    let abierto: StoreNotificacion | undefined;
    f.componentInstance.open.subscribe(n => (abierto = n));
    ((f.nativeElement as HTMLElement).querySelector('.aviso-item') as HTMLElement).click();
    expect(abierto?.id).toBe('7');
  });
});
