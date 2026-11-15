import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudConPedido, StoreAdminService } from '../../store-admin.service';
import { AdminStoreKpiComponent } from '../admin-store-kpi/admin-store-kpi.component';
import { AdminStoreReturnRequestComponent } from '../admin-store-return-request/admin-store-return-request.component';

/** Cambios y devoluciones: lo pendiente primero, con lo que ya se resolvió debajo. */
@Component({
  standalone: true,
  imports: [CommonModule, AdminStoreKpiComponent, AdminStoreReturnRequestComponent],
  selector: 'app-admin-store-returns',
  templateUrl: './admin-store-returns.component.html',
  styleUrls: ['./admin-store-returns.component.scss'],
})
export class AdminStoreReturnsComponent {
  readonly ui = inject(StoreAdminService);
  readonly verResueltas = signal(false);

  trackId = (_: number, i: SolicitudConPedido) => i.solicitud.id;
}
