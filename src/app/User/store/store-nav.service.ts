import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { StoreService } from 'src/app/Core/Services/store.service';
import { StoreNotificacion } from 'src/app/Core/Models/store.models';

export type Vista = 'home' | 'prod' | 'cart' | 'chk' | 'ok' | 'mine' | 'track';
/** Hojas inferiores: elegir talla, cambiar dirección o elegir nueva fecha de entrega. */
export type Hoja = { tipo: 'tallas' | 'direccion' | 'fecha'; id?: string };
export interface Dialogo { titulo: string; texto: string; ok: string; conservar: string; accion: () => void; }
interface Posicion { vista: Vista; producto: string | null; pedido: string | null; }

/**
 * Dónde está el cliente dentro de la tienda y qué ventanas tiene abiertas (hoja, confirmación,
 * aviso y banner). Lo provee `StoreComponent`, así que vive y muere con la pantalla.
 */
@Injectable()
export class StoreNavService implements OnDestroy {
  private readonly router = inject(Router);
  private readonly store = inject(StoreService);

  readonly vista = signal<Vista>('home');
  readonly productoId = signal<string | null>(null);
  readonly pedidoNo = signal<string | null>(null);
  readonly hoja = signal<Hoja | null>(null);
  readonly dialogo = signal<Dialogo | null>(null);
  readonly aviso = signal<{ texto: string; verCarrito: boolean } | null>(null);
  readonly banner = signal<StoreNotificacion | null>(null);
  /** Se emite en cada cambio de vista; la pantalla lo usa para volver al inicio del contenido. */
  readonly navegado = new Subject<void>();

  private pila: Posicion[] = [];
  private temporizadorAviso?: ReturnType<typeof setTimeout>;
  private temporizadorBanner?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    clearTimeout(this.temporizadorAviso);
    clearTimeout(this.temporizadorBanner);
  }

  // ── Navegación interna ──
  ir(vista: Vista, id: string | null = null): void {
    const actual: Posicion = { vista: this.vista(), producto: this.productoId(), pedido: this.pedidoNo() };
    if (vista === 'home' || vista === 'ok') this.pila = [];
    else if (actual.vista !== vista || (vista === 'prod' && actual.producto !== id) || (vista === 'track' && actual.pedido !== id)) this.pila.push(actual);
    if (vista === 'prod') this.productoId.set(id);
    if (vista === 'track') this.pedidoNo.set(id);
    this.hoja.set(null);
    this.vista.set(vista);
    this.navegado.next();
  }

  /** Flecha del ScreenShell: dentro de la tienda retrocede; en la portada sale al inicio de la app. */
  onBack(): void {
    const previa = this.pila.pop();
    if (previa) {
      this.productoId.set(previa.producto);
      this.pedidoNo.set(previa.pedido);
      this.vista.set(previa.vista);
      this.navegado.next();
    } else if (this.vista() === 'home') {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.ir('home');
    }
  }

  // ── Avisos, banner y confirmación ──
  mostrarAviso(texto: string, verCarrito = false): void {
    clearTimeout(this.temporizadorAviso);
    this.aviso.set({ texto, verCarrito });
    this.temporizadorAviso = setTimeout(() => this.aviso.set(null), 3200);
  }

  mostrarBanner(n: StoreNotificacion): void {
    this.banner.set(n);
    clearTimeout(this.temporizadorBanner);
    this.temporizadorBanner = setTimeout(() => this.banner.set(null), 4500);
  }

  /** Abre el pedido de un aviso y lo marca como leído. */
  abrirAviso(n: StoreNotificacion): void {
    this.store.marcarLeida(n.id);
    this.banner.set(null);
    if (n.pedidoNo) this.ir('track', n.pedidoNo);
  }

  pedirConfirmacion(d: Dialogo): void {
    this.dialogo.set(d);
  }
  aceptarDialogo(): void {
    const d = this.dialogo();
    this.dialogo.set(null);
    d?.accion();
  }
  cancelarDialogo(): void {
    this.dialogo.set(null);
  }
}
