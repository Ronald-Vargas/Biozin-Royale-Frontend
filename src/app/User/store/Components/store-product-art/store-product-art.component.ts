import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from 'src/app/Core/Models/store.models';

/** Foto del producto (Supabase Storage); si no hay o no carga, el dibujo vectorial. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-store-product-art',
  templateUrl: './store-product-art.component.html',
  styleUrls: ['./store-product-art.component.scss'],
})
export class StoreProductArtComponent {
  /** true cuando la foto no cargó; se vuelve al dibujo vectorial. */
  fotoRota = false;

  private _producto!: Producto;
  @Input({ required: true })
  set producto(p: Producto) {
    if (this._producto?.id !== p.id) this.fotoRota = false;
    this._producto = p;
  }
  get producto(): Producto { return this._producto; }
}
