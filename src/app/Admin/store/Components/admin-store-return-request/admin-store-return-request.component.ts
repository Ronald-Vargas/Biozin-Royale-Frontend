import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { textoEstadoSolicitud, textoTipoSolicitud } from 'src/app/Core/Models/store.models';
import { SolicitudConPedido, StoreAdminService } from '../../store-admin.service';

/**
 * Una solicitud de cambio o devolución con sus acciones: pendiente (aprobar o rechazar, con una
 * nota opcional) o ya resuelta (lo que se decidió y quién lo hizo). La usan tanto la lista general
 * de Devoluciones como la hoja de un pedido.
 */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-store-return-request',
  templateUrl: './admin-store-return-request.component.html',
  styleUrls: ['./admin-store-return-request.component.scss'],
})
export class AdminStoreReturnRequestComponent {
  private readonly ui = inject(StoreAdminService);

  @Input({ required: true }) item!: SolicitudConPedido;
  /** Oculta el número de pedido cuando ya se está dentro de ese pedido. */
  @Input() mostrarPedido = true;
  @Output() resuelta = new EventEmitter<void>();

  readonly nota = signal('');
  readonly enviando = signal(false);

  tipoDe(i: SolicitudConPedido): string { return textoTipoSolicitud(i.solicitud); }
  estadoDe(i: SolicitudConPedido): string { return textoEstadoSolicitud(i.solicitud); }

  async aprobar(): Promise<void> {
    this.enviando.set(true);
    const ok = await this.ui.ejecutar(this.ui.store.aprobarSolicitud(this.item.solicitud.id, this.nota()), 'Solicitud aprobada.');
    this.enviando.set(false);
    if (ok) this.resuelta.emit();
  }
  async rechazar(): Promise<void> {
    this.enviando.set(true);
    const ok = await this.ui.ejecutar(this.ui.store.rechazarSolicitud(this.item.solicitud.id, this.nota()), 'Solicitud rechazada.');
    this.enviando.set(false);
    if (ok) this.resuelta.emit();
  }
}
