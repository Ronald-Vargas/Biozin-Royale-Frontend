import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from 'src/app/Core/Models/store.models';
import { StoreCartService } from '../../store-cart.service';
import { StoreNavService } from '../../store-nav.service';
import { StoreProductArtComponent } from '../store-product-art/store-product-art.component';

/** Tarjeta de producto: imagen, precio y botón de añadir / elegir talla / cantidad. */
@Component({
  standalone: true,
  imports: [CommonModule, StoreProductArtComponent],
  selector: 'app-store-product-card',
  templateUrl: './store-product-card.component.html',
  styleUrls: ['./store-product-card.component.scss'],
})
export class StoreProductCardComponent {
  readonly cart = inject(StoreCartService);
  readonly nav = inject(StoreNavService);

  @Input({ required: true }) producto!: Producto;
}
