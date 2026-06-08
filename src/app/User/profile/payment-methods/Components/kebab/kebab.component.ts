import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../shared/components/svg-icons/svg-icon.component';
import {
  ICON_DOTS_VERT, ICON_STAR_OUT, ICON_EYE, ICON_TRASH,
} from '../../../shared/icons/icons';

interface KebabItem {
  label:   string;
  icon:    string;
  danger?: boolean;
}

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-kebab',
  templateUrl: './kebab.component.html',
  styleUrls: ['./kebab.component.scss'],
})
export class KebabComponent {
  @Input() id = '';

  open = false;
  iconDots = ICON_DOTS_VERT;

  items: KebabItem[] = [
    { label: 'Favorito',  icon: ICON_STAR_OUT },
    { label: 'Ver datos', icon: ICON_EYE },
    { label: 'Eliminar',  icon: ICON_TRASH, danger: true },
  ];

  toggle(event: Event) {
    event.stopPropagation();
    this.open = !this.open;
  }

  select(event: Event) {
    event.stopPropagation();
    this.open = false;
  }

  @HostListener('document:click')
  onDocClick() {
    this.open = false;
  }
}