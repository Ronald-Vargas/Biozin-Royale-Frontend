import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Marco de las ventanas de la tienda: fondo oscuro + hoja inferior, o diálogo centrado.
 * El contenido se proyecta; cada pantalla pone su propio diseño interno.
 */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-store-sheet',
  templateUrl: './store-sheet.component.html',
  styleUrls: ['./store-sheet.component.scss'],
})
export class StoreSheetComponent {
  /** Diálogo centrado en lugar de hoja inferior. */
  @Input() centered = false;
  /** La hoja puede ocupar hasta el 88 % de la pantalla y se desplaza por dentro. */
  @Input() scroll = false;
  /** Se emite al tocar el fondo. */
  @Output() closed = new EventEmitter<void>();
}
