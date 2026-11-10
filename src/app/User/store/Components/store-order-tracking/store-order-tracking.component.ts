import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from 'src/app/Core/Services/store.service';
import {
  ETAPAS, Pedido, etapaActual, fechaDeFase, puedeCancelar, textoMetodo, textoPago, totalPedido,
} from 'src/app/Core/Models/store.models';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { StoreNavService } from '../../store-nav.service';
import { ItemLinea, StoreTimelineComponent } from '../store-timeline/store-timeline.component';

/** Seguimiento de un pedido: estado, código de entrega, línea de tiempo, resumen y acciones del cliente. */
@Component({
  standalone: true,
  imports: [CommonModule, StoreTimelineComponent],
  selector: 'app-store-order-tracking',
  templateUrl: './store-order-tracking.component.html',
  styleUrls: ['./store-order-tracking.component.scss'],
})
export class StoreOrderTrackingComponent {
  private readonly store = inject(StoreService);
  private readonly balanceSvc = inject(BalanceService);
  private readonly nav = inject(StoreNavService);

  readonly estrellas = [1, 2, 3, 4, 5];
  readonly pedido = computed(() => this.store.pedidos().find(p => p.no === this.nav.pedidoNo()) ?? null);
  readonly lineaTiempo = computed<ItemLinea[]>(() => {
    const p = this.pedido();
    return p ? this.armarLinea(p) : [];
  });

  etapa(p: Pedido) { return etapaActual(p); }
  totalDe(p: Pedido): number { return totalPedido(p); }
  fechaDe(p: Pedido, fase: number): string { return fechaDeFase(p, fase); }
  textoPago(p: Pedido): string { return textoPago(p); }
  metodoTexto(p: Pedido): string { return textoMetodo(p); }

  /** Cuando el pedido va en reparto, el cliente ve su código de entrega. */
  muestraCodigo(p: Pedido): boolean {
    return !p.cancelado && !p.incidenciaAbierta && p.fase === 5;
  }
  puedeCancelar(p: Pedido): boolean {
    return puedeCancelar(p, 'cliente');
  }
  puedeCambiarDireccion(p: Pedido): boolean {
    return !p.cancelado && p.fase <= 2;
  }

  /** Hitos con fecha y hora, más las incidencias y reprogramaciones. */
  private armarLinea(p: Pedido): ItemLinea[] {
    const salida: ItemLinea[] = [];
    for (const e of ETAPAS) {
      const alcanzada = e.fase <= p.fase && (!p.cancelado || e.fase === 0 || p.eventos.some(x => x.fase === e.fase));
      const evento = p.eventos.find(x => x.fase === e.fase && (x.tipo === 'fase' || x.tipo === 'pago'));
      const actual = alcanzada && e.fase === p.fase && !p.cancelado;
      salida.push({
        titulo: e.nombre,
        detalle: alcanzada && evento ? `${evento.fecha} · ${e.texto}` : e.texto,
        clase: actual ? 'now' : alcanzada ? 'on' : 'off',
      });
      if (e.fase === 5) {
        for (const x of p.eventos.filter(v => v.tipo === 'incidencia' || v.tipo === 'reprogramacion')) {
          salida.push({
            titulo: x.tipo === 'incidencia' ? 'Intento fallido' : 'Entrega reprogramada',
            detalle: `${x.fecha} · ${x.texto.split(' · ').slice(1).join(' · ') || x.texto}`,
            clase: x.tipo === 'incidencia' ? 'warn' : 'on',
          });
        }
      }
    }
    const cancelacion = p.eventos.find(x => x.tipo === 'cancelacion');
    if (cancelacion) salida.push({ titulo: 'Pedido cancelado', detalle: `${cancelacion.fecha} · ${cancelacion.texto}`, clase: 'warn' });
    return salida;
  }

  // ── Acciones del cliente sobre su pedido ──
  pedirCancelar(p: Pedido): void {
    this.nav.pedirConfirmacion({
      titulo: `¿Cancelar el pedido ${p.no}?`,
      texto: p.estadoPago === 'confirmado'
        ? 'Te devolvemos tu pago y las unidades vuelven al inventario. Esta acción no se puede deshacer.'
        : 'Las unidades vuelven al inventario. Esta acción no se puede deshacer.',
      ok: 'Cancelar pedido',
      conservar: 'Conservar pedido',
      accion: async () => {
        const r = await this.store.cancelar(p.no);
        if (r.ok) this.balanceSvc.reload();
        this.nav.mostrarAviso(r.ok ? `Pedido ${p.no} cancelado.` : r.error);
      },
    });
  }
  abrirDireccion(p: Pedido): void {
    this.nav.hoja.set({ tipo: 'direccion', id: p.no });
  }
  abrirFechas(p: Pedido): void {
    this.nav.hoja.set({ tipo: 'fecha', id: p.no });
  }
  async calificar(p: Pedido, estrellas: number): Promise<void> {
    const r = await this.store.calificar(p.no, estrellas);
    this.nav.mostrarAviso(r.ok ? 'Gracias por calificar tu entrega.' : r.error);
  }
  async pedirCambio(p: Pedido): Promise<void> {
    const r = await this.store.solicitarCambio(p.no);
    this.nav.mostrarAviso(r.ok ? 'Recibimos tu solicitud de cambio.' : r.error);
  }
}
