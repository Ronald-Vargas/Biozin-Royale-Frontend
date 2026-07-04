import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconComponent],
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() value = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() help = '';
  @Output() valueChange = new EventEmitter<string>();

  onInput(v: string) {
    this.value = v;
    this.valueChange.emit(v);
  }
}