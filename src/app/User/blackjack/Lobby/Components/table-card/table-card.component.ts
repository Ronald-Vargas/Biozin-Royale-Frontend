import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../../shared/Components/svg-icons/svg-icons.component';
import { AvatarStackComponent } from '../avatar-stack/avatar-stack.component';
import { CountRingComponent }   from '../count-ring/count-ring.component';
import { BjTable } from '../../tables.data';
import { ICON_PEOPLE } from '../../../../shared/icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent, AvatarStackComponent, CountRingComponent],
  selector: 'app-table-card',
  templateUrl: './table-card.component.html',
  styleUrls: ['./table-card.component.scss'],
})

export class TableCardComponent {
  @Input() table!: BjTable;
  @Output() join = new EventEmitter<BjTable>();

  iconPeople = ICON_PEOPLE;

  get tagBg(): string | null {
    if (this.table.tag === 'POPULAR') return 'linear-gradient(135deg,#2e8b57,#176b39)';
    return null;
  }

  get isPopular(): boolean { return this.table.tag === 'POPULAR'; }
  get idLabel(): string { return String(this.table.id).padStart(2, '0'); }

  get betRange(): string {
    return `$${this.table.min.toLocaleString()} - $${this.table.max.toLocaleString()}`;
  }

  // Mesa con ronda en curso: el anillo dice "EN JUEGO" en vez de contar
  get isPlaying(): boolean {
    return ['dealing', 'acting', 'dealer', 'settled'].includes(this.table.state ?? '');
  }

  get ringCaption(): string { return this.isPlaying ? 'EN JUEGO' : 'INICIA EN'; }

  onClick(): void {
    // No se puede entrar a una mesa con una ronda en curso — el servidor la
    // rechazaría igual; esto solo evita el viaje redondo y el toast de error.
    if (this.isPlaying) return;
    this.join.emit(this.table);
  }
}