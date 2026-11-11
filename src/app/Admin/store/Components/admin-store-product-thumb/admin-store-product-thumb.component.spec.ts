import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Producto } from 'src/app/Core/Models/store.models';
import { AdminStoreProductThumbComponent } from './admin-store-product-thumb.component';

const producto = (extra: Partial<Producto> = {}): Producto => ({
  id: 'p-1', nombre: 'Camiseta Royale', categoria: 'Camisetas', precio: 28, arte: 'tee',
  variante: '#15110a', stock: 10, etiqueta: '', descripcion: '', visible: true, requiereTalla: false,
  tallas: [], imagen: '', ...extra,
});

describe('AdminStoreProductThumbComponent', () => {
  let fixture: ComponentFixture<AdminStoreProductThumbComponent>;
  let comp: AdminStoreProductThumbComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminStoreProductThumbComponent] }).compileComponents();
    fixture = TestBed.createComponent(AdminStoreProductThumbComponent);
    comp = fixture.componentInstance;
  });

  function img(): HTMLImageElement {
    return (fixture.nativeElement as HTMLElement).querySelector('img') as HTMLImageElement;
  }

  it('muestra la foto del producto cuando la tiene', () => {
    comp.producto = producto({ imagen: 'https://cdn/br-t1.webp' });
    fixture.detectChanges();
    expect(img().src).toBe('https://cdn/br-t1.webp');
  });

  it('sin foto, muestra el logo sobre el color de la prenda', () => {
    comp.producto = producto({ imagen: '', variante: '#3a1319' });
    fixture.detectChanges();
    expect(img().src).toContain('assets/logo.png');
    const mini = (fixture.nativeElement as HTMLElement).querySelector('.mini') as HTMLElement;
    expect(mini.style.background).toBe('rgb(58, 19, 25)');
  });

  it('si la foto falla al cargar, vuelve al logo', () => {
    comp.producto = producto({ imagen: 'https://cdn/rota.webp' });
    fixture.detectChanges();
    img().dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(img().src).toContain('assets/logo.png');
  });

  it('al cambiar de producto, olvida que la foto anterior había fallado', () => {
    comp.producto = producto({ id: 'p-1', imagen: 'https://cdn/rota.webp' });
    fixture.detectChanges();
    img().dispatchEvent(new Event('error'));
    fixture.detectChanges();

    comp.producto = producto({ id: 'p-2', imagen: 'https://cdn/br-t2.webp' });
    fixture.detectChanges();
    expect(img().src).toBe('https://cdn/br-t2.webp');
  });
});
