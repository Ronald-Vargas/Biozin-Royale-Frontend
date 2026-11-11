import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreLocationFieldsComponent } from './store-location-fields.component';

describe('StoreLocationFieldsComponent', () => {
  let fixture: ComponentFixture<StoreLocationFieldsComponent>;
  let comp: StoreLocationFieldsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StoreLocationFieldsComponent] }).compileComponents();
    fixture = TestBed.createComponent(StoreLocationFieldsComponent);
    comp = fixture.componentInstance;
  });

  it('lista las 7 provincias', () => {
    expect(comp.provincias.length).toBe(7);
    expect(comp.provincias).toContain('Limón');
  });

  it('solo ofrece los cantones de la provincia elegida', () => {
    comp.cambiarProvincia('Heredia');
    expect(comp.cantones).toContain('Barva');
    expect(comp.cantones).not.toContain('Escazú');   // cantón de San José
  });

  it('solo ofrece los distritos del cantón elegido', () => {
    comp.cambiarProvincia('Heredia');
    comp.cambiarCanton('Barva');
    expect(comp.distritos).toEqual(['Barva', 'San Pedro', 'San Pablo', 'San Roque', 'Santa Lucía', 'San José de la Montaña']);
  });

  it('cambiar la provincia limpia el cantón y el distrito', () => {
    comp.cambiarProvincia('Heredia');
    comp.cambiarCanton('Barva');
    comp.cambiarDistrito('San Pedro');

    const cantonChanges: string[] = [];
    const distritoChanges: string[] = [];
    comp.cantonChange.subscribe(v => cantonChanges.push(v));
    comp.distritoChange.subscribe(v => distritoChanges.push(v));

    comp.cambiarProvincia('Cartago');
    expect(comp.canton).toBe('');
    expect(comp.distrito).toBe('');
    expect(cantonChanges).toEqual(['']);
    expect(distritoChanges).toEqual(['']);
  });

  it('cambiar el cantón limpia el distrito sin tocar la provincia', () => {
    comp.cambiarProvincia('Cartago');
    comp.cambiarCanton('Turrialba');
    comp.cambiarDistrito('La Suiza');

    comp.cambiarCanton('Paraíso');
    expect(comp.provincia).toBe('Cartago');
    expect(comp.distrito).toBe('');
  });

  it('renderiza las tres etiquetas', () => {
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Provincia');
    expect(texto).toContain('Cantón');
    expect(texto).toContain('Distrito');
  });

  it('un cantón o distrito con nombre largo no desborda la fila de dos columnas', () => {
    // El host es `display: contents`, así que mide igual que en la pantalla real:
    // dentro de una caja angosta (celular), junto a otros campos del formulario.
    const caja = document.createElement('div');
    caja.style.width = '360px';
    caja.style.boxSizing = 'border-box';
    caja.style.padding = '0 16px';
    document.body.appendChild(caja);
    caja.appendChild(fixture.nativeElement);

    comp.cambiarProvincia('San José');
    comp.cambiarCanton('Vázquez De Coronado');   // uno de los cantones más largos
    comp.cambiarDistrito('Dulce Nombre De Jesus'); // y uno de los distritos más largos
    fixture.detectChanges();

    const dos = caja.querySelector('.dos') as HTMLElement;
    expect(dos).toBeTruthy();
    expect(dos.scrollWidth).toBeLessThanOrEqual(dos.clientWidth);
    expect(caja.scrollWidth).toBeLessThanOrEqual(caja.clientWidth);

    caja.remove();
  });
});
