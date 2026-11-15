import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from 'src/app/Core/Services/store.service';
import { ItemPedido, MOTIVOS_SOLICITUD, TipoSolicitud, tieneSolicitudActiva } from 'src/app/Core/Models/store.models';
import { StoreSheetComponent } from 'src/app/User/shared/Components/store-sheet/store-sheet.component';
import { StoreNavService } from '../../store-nav.service';

const TALLAS = ['S', 'M', 'L', 'XL'];

/** Hoja para pedir un cambio de talla o una devolución de un artículo ya entregado. */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, StoreSheetComponent],
  selector: 'app-store-return-sheet',
  templateUrl: './store-return-sheet.component.html',
  styleUrls: ['./store-return-sheet.component.scss'],
})
export class StoreReturnSheetComponent implements OnInit {
  private readonly store = inject(StoreService);
  readonly nav = inject(StoreNavService);

  @Input({ required: true }) pedidoNo = '';
  readonly motivos = MOTIVOS_SOLICITUD;
  readonly error = signal('');
  readonly enviando = signal(false);

  /** Artículos del pedido que todavía no tienen una solicitud activa. */
  readonly items = computed<ItemPedido[]>(() => {
    const p = this.store.pedido(this.pedidoNo);
    return p ? p.items.filter(i => !tieneSolicitudActiva(p, i.itemId)) : [];
  });

  readonly itemId = signal('');
  readonly tipo = signal<TipoSolicitud>('devolucion');
  readonly motivo = signal(MOTIVOS_SOLICITUD[0]);
  readonly detalle = signal('');
  readonly cantidad = signal(1);
  readonly tallaNueva = signal('');

  readonly itemSeleccionado = computed(() => this.items().find(i => i.itemId === this.itemId()));
  readonly puedeCambiarTalla = computed(() => !!this.itemSeleccionado()?.talla);
  readonly tallasDisponibles = computed(() => TALLAS.filter(t => t !== this.itemSeleccionado()?.talla));

  ngOnInit(): void {
    const primero = this.items()[0];
    if (primero) this.itemId.set(primero.itemId);
  }

  elegirItem(id: string): void {
    this.itemId.set(id);
    this.cantidad.set(1);
    this.tallaNueva.set('');
    if (!this.puedeCambiarTalla() && this.tipo() === 'cambio') this.tipo.set('devolucion');
  }
  elegirTipo(t: TipoSolicitud): void {
    this.tipo.set(t);
    this.tallaNueva.set('');
  }

  async enviar(): Promise<void> {
    const item = this.itemSeleccionado();
    const error =
      !item ? 'Elige el artículo.'
      : this.tipo() === 'cambio' && !this.tallaNueva() ? 'Elige la talla que quieres a cambio.'
      : '';
    this.error.set(error);
    if (error || !item) return;

    this.enviando.set(true);
    const r = await this.store.crearSolicitud(this.pedidoNo, {
      itemId: item.itemId, tipo: this.tipo(), motivo: this.motivo(), detalle: this.detalle(),
      cantidad: this.cantidad(), tallaNueva: this.tipo() === 'cambio' ? this.tallaNueva() : undefined,
    });
    this.enviando.set(false);
    if (!r.ok) { this.error.set(r.error); return; }
    this.nav.hoja.set(null);
    this.nav.mostrarAviso(this.tipo() === 'cambio' ? 'Pedimos tu cambio de talla.' : 'Pedimos tu devolución.');
  }

  rango(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  trackTalla = (_: number, t: string) => t;
  trackItem = (_: number, i: ItemPedido) => i.itemId;
  trackN = (_: number, n: number) => n;
}
