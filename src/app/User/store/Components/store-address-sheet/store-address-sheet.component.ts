import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from 'src/app/Core/Services/store.service';
import { PROVINCIAS } from 'src/app/Core/Models/store.models';
import { StoreSheetComponent } from 'src/app/User/shared/Components/store-sheet/store-sheet.component';
import { StoreNavService } from '../../store-nav.service';

/** Hoja para cambiar la dirección de entrega mientras el pedido no esté empacado. */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, StoreSheetComponent],
  selector: 'app-store-address-sheet',
  templateUrl: './store-address-sheet.component.html',
  styleUrls: ['./store-address-sheet.component.scss'],
})
export class StoreAddressSheetComponent implements OnInit {
  private readonly store = inject(StoreService);
  readonly nav = inject(StoreNavService);

  @Input({ required: true }) pedidoNo = '';
  readonly provincias = PROVINCIAS;
  readonly error = signal('');
  provincia = 'Limón';
  direccion = '';

  ngOnInit(): void {
    const p = this.store.pedido(this.pedidoNo);
    if (p) {
      this.provincia = p.provincia;
      this.direccion = p.domicilio;
    }
  }

  async guardar(): Promise<void> {
    if (this.direccion.trim().length < 8) {
      this.error.set('Escribe una dirección exacta para el envío.');
      return;
    }
    this.error.set('');
    const r = await this.store.cambiarDireccion(this.pedidoNo, this.provincia, this.direccion.trim());
    if (!r.ok) { this.error.set(r.error); return; }
    this.nav.hoja.set(null);
    this.nav.mostrarAviso('Dirección actualizada.');
  }
}
