import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Aviso breve en una píldora sobre el menú inferior; opcionalmente con un botón de acción. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-store-toast',
  templateUrl: './store-toast.component.html',
  styleUrls: ['./store-toast.component.scss'],
})
export class StoreToastComponent {
  @Input({ required: true }) text = '';
  /** Texto del botón; sin él no se muestra ninguno. */
  @Input() actionLabel = '';
  /** Capa (z-index) para colocarlo por encima o por debajo de otros elementos de la pantalla. */
  @Input() layer = 20;
  @Output() action = new EventEmitter<void>();
}
