import { Component, Input } from '@angular/core';

/** Indicador del tablero: etiqueta pequeña y valor grande. */
@Component({
  standalone: true,
  selector: 'app-admin-store-kpi',
  templateUrl: './admin-store-kpi.component.html',
  styleUrls: ['./admin-store-kpi.component.scss'],
})
export class AdminStoreKpiComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number | null = '';
}
