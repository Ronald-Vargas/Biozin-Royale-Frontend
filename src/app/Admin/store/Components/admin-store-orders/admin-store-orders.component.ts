import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { Grupo, GRUPOS } from 'src/app/Core/Models/store.models';
import { StoreAdminService } from '../../store-admin.service';
import { AdminStoreOrderListComponent } from '../admin-store-order-list/admin-store-order-list.component';

/** Pedidos: búsqueda por número o cliente y filtro por etapa. */
@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent, AdminStoreOrderListComponent],
  selector: 'app-admin-store-orders',
  templateUrl: './admin-store-orders.component.html',
  styleUrls: ['./admin-store-orders.component.scss'],
})
export class AdminStoreOrdersComponent {
  readonly ui = inject(StoreAdminService);
  readonly iconBuscar = ICON_SEARCH;
  readonly filtros: ('Todos' | Grupo)[] = ['Todos', ...GRUPOS];
}
