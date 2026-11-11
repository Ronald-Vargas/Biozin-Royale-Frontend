import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from 'src/app/Core/Services/store.service';
import { StoreSheetComponent } from 'src/app/User/shared/Components/store-sheet/store-sheet.component';
import { StoreLocationFieldsComponent } from 'src/app/User/shared/Components/store-location-fields/store-location-fields.component';
import { StoreNavService } from '../../store-nav.service';

/** Hoja para cambiar la dirección de entrega mientras el pedido no esté empacado. */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, StoreSheetComponent, StoreLocationFieldsComponent],
  selector: 'app-store-address-sheet',
  templateUrl: './store-address-sheet.component.html',
  styleUrls: ['./store-address-sheet.component.scss'],
})
export class StoreAddressSheetComponent implements OnInit {
  private readonly store = inject(StoreService);
  readonly nav = inject(StoreNavService);

  @Input({ required: true }) pedidoNo = '';
  readonly error = signal('');
  provincia = '';
  canton = '';
  distrito = '';
  direccion = '';

  ngOnInit(): void {
    const p = this.store.pedido(this.pedidoNo);
    if (p) {
      this.provincia = p.provincia;
      this.canton = p.canton;
      this.distrito = p.distrito;
      this.direccion = p.senas;
    }
  }

  async guardar(): Promise<void> {
    const error =
      !this.provincia ? 'Elige la provincia de entrega.'
      : !this.canton ? 'Elige el cantón de entrega.'
      : !this.distrito ? 'Elige el distrito de entrega.'
      : this.direccion.trim().length < 5 ? 'Escribe las señas exactas para el envío.'
      : '';
    this.error.set(error);
    if (error) return;

    const r = await this.store.cambiarDireccion(this.pedidoNo, this.provincia, this.canton, this.distrito, this.direccion.trim());
    if (!r.ok) { this.error.set(r.error); return; }
    this.nav.hoja.set(null);
    this.nav.mostrarAviso('Dirección actualizada.');
  }
}
