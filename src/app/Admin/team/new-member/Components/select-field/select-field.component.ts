import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHEVRON_DOWN, ICON_CHECK } from 'src/app/User/shared/icons/icons';


@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss'],
})
export class SelectFieldComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() value = '';
  @Input() options: string[] = [];
  @Input() help = '';
  @Output() valueChange = new EventEmitter<string>();

  iconChevron = ICON_CHEVRON_DOWN;
  iconCheck   = ICON_CHECK;

  open = false;

  toggle() { this.open = !this.open; }

  select(o: string) {
    this.value = o;
    this.valueChange.emit(o);
    this.open = false;
  }

  isLast(i: number): boolean { return i === this.options.length - 1; }
}