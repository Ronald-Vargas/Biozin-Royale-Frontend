import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Barra fija sobre el menú con el total (o el precio) y el botón principal de la ventana. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-store-cta',
  templateUrl: './store-cta.component.html',
  styleUrls: ['./store-cta.component.scss'],
})
export class StoreCtaComponent {
  @Input() label = 'Total';
  @Input() amount = 0;
  @Input({ required: true }) buttonText = '';
  @Input() disabled = false;
  @Output() pressed = new EventEmitter<void>();
}
