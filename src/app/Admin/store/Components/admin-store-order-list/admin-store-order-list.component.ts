import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido, grupoDe, textoMetodo, totalPedido } from 'src/app/Core/Models/store.models';
import { claseGrupo, ultimoMovimiento } from '../../store-admin.utils';

/** Lista de pedidos (número, cliente, total y etapa). Al tocar uno se abre su hoja. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin-store-order-list',
  templateUrl: './admin-store-order-list.component.html',
  styleUrls: ['./admin-store-order-list.component.scss'],
})
export class AdminStoreOrderListComponent {
  @Input({ required: true }) pedidos: Pedido[] = [];
  /** Emite el número del pedido tocado. */
  @Output() abrir = new EventEmitter<string>();

  total(p: Pedido): number { return totalPedido(p); }
  metodo(p: Pedido): string { return textoMetodo(p); }
  grupo(p: Pedido) { return grupoDe(p); }
  clase(p: Pedido): string { return claseGrupo(p); }
  ultimo(p: Pedido): string { return ultimoMovimiento(p); }
  trackNo = (_: number, p: Pedido) => p.no;
}
