import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from 'src/app/Core/Services/store.service';
import { StoreCartService } from '../../store-cart.service';
import { StoreCatalogService } from '../../store-catalog.service';
import { StoreNavService } from '../../store-nav.service';
import { StoreCtaComponent } from '../store-cta/store-cta.component';
import { StoreProductArtComponent } from '../store-product-art/store-product-art.component';
import { StoreProductCardComponent } from '../store-product-card/store-product-card.component';

const TALLAS = ['S', 'M', 'L', 'XL'];

/** Detalle de un producto: imagen, descripción, talla y productos relacionados. */
@Component({
  standalone: true,
  imports: [CommonModule, StoreCtaComponent, StoreProductArtComponent, StoreProductCardComponent],
  selector: 'app-store-product-detail',
  templateUrl: './store-product-detail.component.html',
  styleUrls: ['./store-product-detail.component.scss'],
})
export class StoreProductDetailComponent {
  private readonly store = inject(StoreService);
  readonly cat = inject(StoreCatalogService);
  readonly cart = inject(StoreCartService);
  private readonly nav = inject(StoreNavService);

  readonly tallas = TALLAS;
  readonly talla = signal('M');

  constructor() {
    // Al pasar de un producto a otro se vuelve a la talla M.
    effect(() => {
      this.nav.productoId();
      this.talla.set('M');
    });
  }

  get envioGratisDesde(): number {
    return this.store.config().envioGratisDesde;
  }
  dinero(n: number): string {
    return `$${n.toFixed(2)}`;
  }
  trackId = (_: number, p: { id: string }) => p.id;
}
