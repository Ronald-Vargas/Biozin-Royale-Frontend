import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PinInputComponent } from '../pin-input/pin-input.component';
import { SvgIconComponent } from '../svg-icons/svg-icons.component';
import { ICON_CLOSE } from '../../icons/icons';
import { ProfileService } from 'src/app/Core/Services/profile.service';

/** Pop up que pide el PIN de transacciones. Verifica contra el backend antes de emitir `confirmed`. */
@Component({
  standalone: true,
  imports: [CommonModule, PinInputComponent, SvgIconComponent],
  selector: 'app-pin-confirm-modal',
  templateUrl: './pin-confirm-modal.component.html',
  styleUrls: ['./pin-confirm-modal.component.scss'],
})
export class PinConfirmModalComponent {
  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  iconClose = ICON_CLOSE;

  pinValue = '';
  loading = false;
  errorMsg = '';

  constructor(private readonly profileService: ProfileService) {}

  close(): void {
    this.closed.emit();
  }

  stop(e: Event): void {
    e.stopPropagation();
  }

  submit(): void {
    if (this.loading) return;
    this.errorMsg = '';

    if (this.pinValue.length !== 4) {
      this.errorMsg = 'Ingresa tu PIN de 4 dígitos.';
      return;
    }

    this.loading = true;
    this.profileService.verifyPin(this.pinValue).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'PIN incorrecto.';
          this.pinValue = '';
          return;
        }
        this.confirmed.emit();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.strResponseMessage || 'Error de conexión. Intenta de nuevo.';
        this.pinValue = '';
      },
    });
  }
}
