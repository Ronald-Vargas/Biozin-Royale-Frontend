import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreSheetComponent } from 'src/app/User/shared/Components/store-sheet/store-sheet.component';
import { StoreCartService } from '../../store-cart.service';
import { StoreNavService } from '../../store-nav.service';

/** Hoja para elegir la talla antes de añadir una prenda al carrito. */
@Component({
  standalone: true,
  imports: [CommonModule, StoreSheetComponent],
  selector: 'app-store-size-sheet',
  templateUrl: './store-size-sheet.component.html',
  styleUrls: ['./store-size-sheet.component.scss'],
})
export class StoreSizeSheetComponent {
  readonly cart = inject(StoreCartService);
  readonly nav = inject(StoreNavService);

  @Input({ required: true }) productoId = '';
  readonly tallas = ['S', 'M', 'L', 'XL'];
}
