import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreNotificacion } from 'src/app/Core/Models/store.models';

/** Lista de avisos de la tienda con "marcar como leídos". Cada pantalla pone la caja que la rodea. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-store-notice-list',
  templateUrl: './store-notice-list.component.html',
  styleUrls: ['./store-notice-list.component.scss'],
})
export class StoreNoticeListComponent {
  @Input({ required: true }) avisos: StoreNotificacion[] = [];
  /** Cantidad de avisos sin leer; con 0 no se ofrece "marcar como leídos". */
  @Input() unread = 0;
  /** Cuántos avisos mostrar. */
  @Input() limit = 4;
  @Output() open = new EventEmitter<StoreNotificacion>();
  @Output() markAll = new EventEmitter<void>();
}
