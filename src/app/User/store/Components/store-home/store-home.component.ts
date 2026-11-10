import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { StoreCatalogService } from '../../store-catalog.service';
import { StoreCategoriesComponent } from '../store-categories/store-categories.component';
import { StoreProductCardComponent } from '../store-product-card/store-product-card.component';

/** Portada de la tienda: buscador, categorías, novedades y lista de productos. */
@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent, StoreCategoriesComponent, StoreProductCardComponent],
  selector: 'app-store-home',
  templateUrl: './store-home.component.html',
  styleUrls: ['./store-home.component.scss'],
})
export class StoreHomeComponent {
  readonly cat = inject(StoreCatalogService);
  readonly iconBuscar = ICON_SEARCH;

  trackId = (_: number, p: { id: string }) => p.id;
}
