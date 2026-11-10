import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StoreSheetComponent } from '../store-sheet/store-sheet.component';

/** Confirmación de una acción que no se puede deshacer (cancelar pedido, eliminar producto…). */
@Component({
  standalone: true,
  imports: [StoreSheetComponent],
  selector: 'app-store-confirm-dialog',
  templateUrl: './store-confirm-dialog.component.html',
  styleUrls: ['./store-confirm-dialog.component.scss'],
})
export class StoreConfirmDialogComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) text = '';
  /** Texto del botón que confirma. */
  @Input() ok = 'Aceptar';
  /** Texto del botón que conserva la situación actual. */
  @Input() keep = 'Volver';
  /** Botones pequeños alineados a la derecha (panel de administración). */
  @Input() compact = false;
  @Output() accepted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
