import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from 'src/app/Core/Models/store.models';
import { colorDe } from '../../store-admin.utils';

/** Miniatura de un producto: su foto si la tiene; si no (o falla), el color de la prenda con el logo. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin-store-product-thumb',
  templateUrl: './admin-store-product-thumb.component.html',
  styleUrls: ['./admin-store-product-thumb.component.scss'],
})
export class AdminStoreProductThumbComponent {
  /** true cuando la foto no cargó; se vuelve al color de la prenda con el logo. */
  fotoRota = false;

  private _producto!: Producto;
  @Input({ required: true })
  set producto(p: Producto) {
    if (this._producto?.id !== p.id) this.fotoRota = false;
    this._producto = p;
  }
  get producto(): Producto { return this._producto; }

  readonly colorDe = colorDe;
}
