import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StoreSheetComponent } from './store-sheet.component';

@Component({
  standalone: true,
  imports: [StoreSheetComponent],
  template: `<app-store-sheet [centered]="centered" (closed)="cerrado = cerrado + 1"><p class="dentro">Contenido</p></app-store-sheet>`,
})
class HostComponent {
  centered = false;
  cerrado = 0;
}

describe('StoreSheetComponent', () => {
  it('proyecta el contenido y avisa al tocar el fondo, pero no al tocar la hoja', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;

    expect(el.querySelector('.hoja .dentro')).toBeTruthy();
    (el.querySelector('.hoja') as HTMLElement).click();
    expect(f.componentInstance.cerrado).toBe(0);
    (el.querySelector('.fondo') as HTMLElement).click();
    expect(f.componentInstance.cerrado).toBe(1);
  });

  it('en modo centrado usa el diálogo', () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.centered = true;
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelector('.dialogo')).toBeTruthy();
    expect(el.querySelector('.hoja')).toBeNull();
  });
});
