import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonInput } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_EYE, ICON_EYE_OFF } from 'src/app/User/shared/icons/icons';


@Component({
  standalone: true,
  imports: [CommonModule, IonInput, ReactiveFormsModule, SvgIconComponent],
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent {
  @Input() label       = '';
  @Input() type        = 'text';
  @Input() placeholder = '';
  @Input() password    = false;
  @Input() control!: FormControl;

  focused      = false;
  showPassword = false;

  iconEye    = ICON_EYE;
  iconEyeOff = ICON_EYE_OFF;

  get effectiveType(): string {
    if (this.password) return this.showPassword ? 'text' : 'password';
    return this.type;
  }

  onFocus()    { this.focused = true; }
  onBlur()     { this.focused = false; }
  toggleShow() { this.showPassword = !this.showPassword; }
}