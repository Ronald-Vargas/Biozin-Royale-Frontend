import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { MetodosPagoService } from 'src/app/Core/Services/metodos-pago.service';
import { ProfileService } from 'src/app/Core/Services/profile.service';
import { StoreService } from 'src/app/Core/Services/store.service';
import { MetodoPago } from 'src/app/Core/Models/metodos-pago.models';
import { Metodo, PROVINCIAS } from 'src/app/Core/Models/store.models';
import { StoreCartService } from '../../store-cart.service';
import { StoreNavService } from '../../store-nav.service';
import { StoreCtaComponent } from '../store-cta/store-cta.component';

/** Pago: datos de envío, método de pago (billetera o una tarjeta ya registrada) y resumen. */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, StoreCtaComponent],
  selector: 'app-store-checkout',
  templateUrl: './store-checkout.component.html',
  styleUrls: ['./store-checkout.component.scss'],
})
export class StoreCheckoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly store = inject(StoreService);
  private readonly balanceSvc = inject(BalanceService);
  private readonly metodosSvc = inject(MetodosPagoService);
  private readonly profileSvc = inject(ProfileService);
  readonly cart = inject(StoreCartService);
  private readonly nav = inject(StoreNavService);

  readonly provincias = PROVINCIAS;
  readonly metodo = signal<Metodo>('wallet');
  /** Tarjetas ya registradas en Métodos de pago; no se vuelve a pedir la tarjeta. */
  readonly tarjetas = signal<MetodoPago[]>([]);
  readonly tarjetaId = signal<string | null>(null);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly saldo = computed(() => this.balanceSvc.balance() ?? 0);

  datos = { telefono: '', provincia: 'Limón', direccion: '' };
  /** Se renueva en cada compra nueva; un reintento del mismo pedido reutiliza la misma. */
  private claveOperacion = crypto.randomUUID();

  get costoEnvio(): number {
    return this.store.config().costoEnvio;
  }
  get envioGratisDesde(): number {
    return this.store.config().envioGratisDesde;
  }

  ngOnInit(): void {
    this.profileSvc.getProfile().subscribe({
      next: r => {
        const tel = (r.returnValue?.phone ?? '').replace(/\D/g, '');
        if (!this.datos.telefono && tel) this.datos.telefono = tel.slice(-8);
      },
    });
    this.metodosSvc.listar().subscribe({
      next: r => {
        const tarjetas = (r.returnValue ?? []).filter(m => m.type === 'card');
        this.tarjetas.set(tarjetas);
        this.tarjetaId.set((tarjetas.find(t => t.isDefault) ?? tarjetas[0])?.id ?? null);
      },
    });
  }

  setMetodo(m: Metodo): void {
    this.metodo.set(m);
    this.error.set('');
  }
  irAMetodosPago(): void {
    this.router.navigate(['/pagos']);
  }
  nombreRed(t: MetodoPago): string {
    return ({ visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex' } as Record<string, string>)[t.network ?? ''] ?? 'Tarjeta';
  }
  vence(t: MetodoPago): string {
    return `${String(t.expiryMonth ?? '').padStart(2, '0')}/${String(t.expiryYear ?? '').slice(-2)}`;
  }
  dinero(n: number): string {
    return `$${n.toFixed(2)}`;
  }

  async confirmar(): Promise<void> {
    if (this.enviando()) return;
    const d = this.datos;
    const m = this.metodo();
    const t = this.cart.totales();
    const sinStock = this.cart.carrito().find(l => l.cantidad > this.cart.stockDe(l.id, l.talla));

    const error =
      !/^\d{8}$/.test(d.telefono.replace(/[\s-]/g, '')) ? 'El teléfono debe tener 8 dígitos.'
      : d.direccion.trim().length < 8 ? 'Escribe una dirección exacta para el envío.'
      : m === 'card' && !this.tarjetaId() ? 'Elige una de tus tarjetas registradas.'
      : sinStock ? `Ya no hay suficiente stock de ${this.cart.nombreDe(sinStock.id)}. Reduce la cantidad en el carrito.`
      : m === 'wallet' && t.total > this.saldo()
        ? `Tu saldo es ${this.dinero(this.saldo())} y el pedido cuesta ${this.dinero(t.total)}. Recarga tu billetera o elige otro método.`
      : '';
    this.error.set(error);
    if (error) return;

    this.enviando.set(true);
    const r = await this.store.crearPedido({
      metodoPago: m,
      tarjetaId: m === 'card' ? this.tarjetaId() ?? undefined : undefined,
      telefono: d.telefono.replace(/[\s-]/g, ''),
      provincia: d.provincia,
      direccion: d.direccion.trim(),
      items: this.cart.carrito().map(l => ({ id: l.id, talla: l.talla, cantidad: l.cantidad })),
      claveOperacion: this.claveOperacion,
    });
    this.enviando.set(false);
    if (!r.ok) {
      this.error.set(r.error);
      void this.store.cargarProductos();
      return;
    }
    this.claveOperacion = crypto.randomUUID();   // la próxima compra es otra operación
    this.cart.vaciar();
    this.balanceSvc.reload();
    this.nav.pedidoNo.set(r.valor.no);
    this.nav.ir('ok');
  }

  trackId = (_: number, p: { id: string }) => p.id;
  trackIdx = (i: number) => i;
}
