import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { StoreConfirmDialogComponent } from 'src/app/User/shared/Components/store-confirm-dialog/store-confirm-dialog.component';
import { StorePushComponent } from 'src/app/User/shared/Components/store-push/store-push.component';
import { StoreSheetComponent } from 'src/app/User/shared/Components/store-sheet/store-sheet.component';
import { StoreToastComponent } from 'src/app/User/shared/Components/store-toast/store-toast.component';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AdminNavComponent } from 'src/app/Admin/shared/admin-nav/admin-nav.component';
import { StoreService } from 'src/app/Core/Services/store.service';
import { SECCIONES, StoreAdminService } from './store-admin.service';
import { AdminStoreInventoryComponent } from './Components/admin-store-inventory/admin-store-inventory.component';
import { AdminStoreLogisticsComponent } from './Components/admin-store-logistics/admin-store-logistics.component';
import { AdminStoreOrderSheetComponent } from './Components/admin-store-order-sheet/admin-store-order-sheet.component';
import { AdminStoreOrdersComponent } from './Components/admin-store-orders/admin-store-orders.component';
import { AdminStoreProductSheetComponent } from './Components/admin-store-product-sheet/admin-store-product-sheet.component';
import { AdminStoreProductsComponent } from './Components/admin-store-products/admin-store-products.component';
import { AdminStoreSummaryComponent } from './Components/admin-store-summary/admin-store-summary.component';

/**
 * Administración de la tienda. Este componente solo arma la pantalla: encabezado, secciones,
 * hojas, aviso y confirmación. Cada sección y cada ventana vive en `Components/`.
 */
@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, AdminHeaderComponent, AdminNavComponent,
    StoreSheetComponent, StoreConfirmDialogComponent, StorePushComponent, StoreToastComponent,
    AdminStoreSummaryComponent, AdminStoreLogisticsComponent, AdminStoreOrdersComponent,
    AdminStoreProductsComponent, AdminStoreInventoryComponent,
    AdminStoreOrderSheetComponent, AdminStoreProductSheetComponent,
  ],
  providers: [StoreAdminService],
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly store = inject(StoreService);
  readonly ui = inject(StoreAdminService);

  readonly secciones = SECCIONES;
  private ultimoAviso = -1;

  constructor() {
    // Aviso emergente cuando llega un pedido nuevo o el cliente hace un cambio.
    effect(() => {
      const lista = this.store.notificaciones();
      if (!this.store.cargado()) return;
      const maximo = Math.max(0, ...lista.map(n => n.ts));
      if (this.ultimoAviso < 0) { this.ultimoAviso = maximo; return; }   // lo que ya existía no es un aviso nuevo
      const nuevo = lista.find(n => n.ts > this.ultimoAviso && !n.leida);
      this.ultimoAviso = Math.max(this.ultimoAviso, maximo);
      if (nuevo) this.ui.mostrarBanner(nuevo);
    });
  }

  ngOnInit(): void {
    void this.store.iniciar(true);
  }

  ngOnDestroy(): void {
    this.store.detener();
  }

  onBack(): void {
    this.router.navigate(['/admin']);
  }
}
