import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UBICACIONES_CR, cantonesDe, distritosDe } from 'src/app/Core/Models/costa-rica.models';

/**
 * Provincia → cantón → distrito en cascada, como un formulario de envío real de Costa Rica.
 * El cantón solo lista los de la provincia elegida y el distrito solo los del cantón elegido;
 * cambiar un nivel superior limpia los que dependen de él.
 */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-store-location-fields',
  templateUrl: './store-location-fields.component.html',
  styleUrls: ['./store-location-fields.component.scss'],
})
export class StoreLocationFieldsComponent {
  readonly provincias = UBICACIONES_CR.map(p => p.nombre);

  @Input() provincia = '';
  @Output() provinciaChange = new EventEmitter<string>();
  @Input() canton = '';
  @Output() cantonChange = new EventEmitter<string>();
  @Input() distrito = '';
  @Output() distritoChange = new EventEmitter<string>();

  get cantones(): string[] {
    return cantonesDe(this.provincia);
  }
  get distritos(): string[] {
    return distritosDe(this.provincia, this.canton);
  }

  cambiarProvincia(v: string): void {
    this.provincia = v;
    this.provinciaChange.emit(v);
    this.cambiarCanton('');
  }
  cambiarCanton(v: string): void {
    this.canton = v;
    this.cantonChange.emit(v);
    this.cambiarDistrito('');
  }
  cambiarDistrito(v: string): void {
    this.distrito = v;
    this.distritoChange.emit(v);
  }
}
