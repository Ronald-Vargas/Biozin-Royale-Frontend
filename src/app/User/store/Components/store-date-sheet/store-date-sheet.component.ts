import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from 'src/app/Core/Services/store.service';
import { StoreSheetComponent } from 'src/app/User/shared/Components/store-sheet/store-sheet.component';
import { StoreNavService } from '../../store-nav.service';

/** Hoja para elegir una nueva ventana de entrega después de un intento fallido. */
@Component({
  standalone: true,
  imports: [CommonModule, StoreSheetComponent],
  selector: 'app-store-date-sheet',
  templateUrl: './store-date-sheet.component.html',
  styleUrls: ['./store-date-sheet.component.scss'],
})
export class StoreDateSheetComponent {
  private readonly store = inject(StoreService);
  readonly nav = inject(StoreNavService);

  @Input({ required: true }) pedidoNo = '';
  readonly ventanas = this.store.ventanasDisponibles();

  async elegir(ventana: string): Promise<void> {
    const r = await this.store.reprogramar(this.pedidoNo, ventana);
    this.nav.hoja.set(null);
    this.nav.mostrarAviso(r.ok ? 'Entrega reprogramada.' : r.error);
  }
}
