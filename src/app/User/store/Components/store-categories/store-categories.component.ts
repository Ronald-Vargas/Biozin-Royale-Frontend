import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categoria } from 'src/app/Core/Models/store.models';

/** Cuadrícula de categorías de la tienda con su ícono y la cantidad de productos. */
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-store-categories',
  templateUrl: './store-categories.component.html',
  styleUrls: ['./store-categories.component.scss'],
})
export class StoreCategoriesComponent {
  @Input({ required: true }) filtros: ('Todas' | Categoria)[] = [];
  @Input({ required: true }) activa: 'Todas' | Categoria = 'Todas';
  @Input({ required: true }) conteos: Record<string, number> = {};
  @Output() elegir = new EventEmitter<'Todas' | Categoria>();
}
