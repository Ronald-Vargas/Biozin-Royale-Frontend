import { Component, ElementRef, OnDestroy, OnInit, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { StoreConfirmDialogComponent } from 'src/app/User/shared/Components/store-confirm-dialog/store-confirm-dialog.component';
import { StorePushComponent } from 'src/app/User/shared/Components/store-push/store-push.component';
import { StoreToastComponent } from 'src/app/User/shared/Components/store-toast/store-toast.component';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { StoreService } from 'src/app/Core/Services/store.service';
import { StoreCartService } from './store-cart.service';
import { StoreCatalogService } from './store-catalog.service';
import { StoreNavService, Vista } from './store-nav.service';
import { StoreAddressSheetComponent } from './Components/store-address-sheet/store-address-sheet.component';
import { StoreCartComponent } from './Components/store-cart/store-cart.component';
import { StoreCheckoutComponent } from './Components/store-checkout/store-checkout.component';
import { StoreDateSheetComponent } from './Components/store-date-sheet/store-date-sheet.component';
import { StoreHomeComponent } from './Components/store-home/store-home.component';
import { StoreMyOrdersComponent } from './Components/store-my-orders/store-my-orders.component';
import { StoreOrderDoneComponent } from './Components/store-order-done/store-order-done.component';
import { StoreOrderTrackingComponent } from './Components/store-order-tracking/store-order-tracking.component';
import { StoreProductDetailComponent } from './Components/store-product-detail/store-product-detail.component';
import { StoreSizeSheetComponent } from './Components/store-size-sheet/store-size-sheet.component';

const TITULOS: Record<Vista, string> = {
  home: 'Tienda', prod: 'Detalle', cart: 'Carrito', chk: 'Pago', ok: 'Pedido', mine: 'Mis pedidos', track: 'Seguimiento',
};

const ICON_RECIBO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>`;
const ICON_CARRITO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11h10.2l2-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>`;

/**
 * Tienda del cliente. Este componente solo arma la pantalla: decide qué ventana mostrar según
 * `StoreNavService` y monta las hojas, el aviso y la confirmación. Cada ventana vive en `Components/`.
 */
@Component({
  standalone: true,
  imports: [
    CommonModule, ScreenShellComponent, SvgIconComponent,
    StoreConfirmDialogComponent, StorePushComponent, StoreToastComponent,
    StoreHomeComponent, StoreProductDetailComponent, StoreCartComponent, StoreCheckoutComponent,
    StoreOrderDoneComponent, StoreMyOrdersComponent, StoreOrderTrackingComponent,
    StoreSizeSheetComponent, StoreAddressSheetComponent, StoreDateSheetComponent,
  ],
  providers: [StoreNavService, StoreCartService, StoreCatalogService],
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly balanceSvc = inject(BalanceService);
  readonly store = inject(StoreService);
  readonly nav = inject(StoreNavService);
  readonly cart = inject(StoreCartService);

  readonly iconRecibo = ICON_RECIBO;
  readonly iconCarrito = ICON_CARRITO;

  readonly titulo = computed(() => TITULOS[this.nav.vista()]);
  readonly mostrarIconos = computed(() => ['home', 'prod', 'mine'].includes(this.nav.vista()));
  readonly noLeidas = computed(() => this.store.notificaciones().filter(n => !n.leida).length);

  private ultimoAviso = -1;
  private readonly navegacion: Subscription = this.nav.navegado.subscribe(() => this.subir());

  constructor() {
    // Aviso emergente cuando llega una notificación nueva (por ejemplo, cuando el admin cambia el estado).
    effect(() => {
      const lista = this.store.notificaciones();
      if (!this.store.cargado()) return;
      const maximo = Math.max(0, ...lista.map(n => n.ts));
      if (this.ultimoAviso < 0) { this.ultimoAviso = maximo; return; }   // lo que ya existía no es un aviso nuevo
      const nuevo = lista.find(n => n.ts > this.ultimoAviso && !n.leida);
      this.ultimoAviso = Math.max(this.ultimoAviso, maximo);
      if (nuevo) this.nav.mostrarBanner(nuevo);
    });
  }

  ngOnInit(): void {
    this.balanceSvc.load();
    void this.store.iniciar(false);
  }

  ngOnDestroy(): void {
    this.store.detener();
    this.navegacion.unsubscribe();
  }

  private subir(): void {
    setTimeout(() => this.host.nativeElement.querySelector('.shell-body')?.scrollTo({ top: 0 }));
  }
}
