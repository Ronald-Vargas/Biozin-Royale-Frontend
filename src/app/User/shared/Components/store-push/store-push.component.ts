import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Aviso emergente en la parte superior, con aspecto de notificación push. */
@Component({
  standalone: true,
  selector: 'app-store-push',
  templateUrl: './store-push.component.html',
  styleUrls: ['./store-push.component.scss'],
})
export class StorePushComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) text = '';
  /** Capa (z-index) sobre el resto de la pantalla. */
  @Input() layer = 40;
  @Output() opened = new EventEmitter<void>();
}
