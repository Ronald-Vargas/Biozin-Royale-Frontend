import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from 'src/app/Core/Services/store.service';
import { StoreCartService } from '../../store-cart.service';
import { StoreNavService } from '../../store-nav.service';
import { StoreCtaComponent } from '../store-cta/store-cta.component';
import { StoreProductArtComponent } from '../store-product-art/store-product-art.component';

/** Carrito: líneas con cantidad, resumen y paso al pago. */
@Component({
  standalone: true,
  imports: [CommonModule, StoreCtaComponent, StoreProductArtComponent],
  selector: 'app-store-cart',
  templateUrl: './store-cart.component.html',
  styleUrls: ['./store-cart.component.scss'],
})
export class StoreCartComponent {
  private readonly store = inject(StoreService);
  readonly cart = inject(StoreCartService);
  readonly nav = inject(StoreNavService);

  get envioGratisDesde(): number {
    return this.store.config().envioGratisDesde;
  }
  trackIdx = (i: number) => i;
}
