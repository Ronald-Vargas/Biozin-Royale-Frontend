import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { PinInputComponent } from 'src/app/User/shared/Components/pin-input/pin-input.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ProfileService } from 'src/app/Core/Services/profile.service';

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, ToggleComponent, PinInputComponent],
  selector: 'app-manage-pin',
  templateUrl: './manage-pin.component.html',
  styleUrls: ['./manage-pin.component.scss'],
})
export class ManagePinComponent implements OnInit {
  loading  = false;
  errorMsg = '';
  successMsg = '';

  // Crear PIN
  newPinValue = '';
  confirmPinValue = '';

  // Confirmar PIN actual para activar/desactivar
  showToggleConfirm = false;
  toggleTargetValue = false;
  togglePinValue = '';

  // Cambiar PIN
  oldPinValue = '';
  changeNewPinValue = '';
  changeConfirmValue = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe();
  }

  get hasPin(): boolean { return this.authService.currentProfile()?.hasPin ?? false; }
  get pinEnabled(): boolean { return this.authService.currentProfile()?.pinEnabled ?? false; }

  goBack(): void { this.router.navigate(['/seguridad']); }

  private resetMessages(): void {
    this.errorMsg = '';
    this.successMsg = '';
  }

  private refreshProfile(): void {
    this.profileService.getProfile().subscribe({ next: () => {}, error: () => {} });
  }

  submitCreate(): void {
    if (this.loading) return;
    this.resetMessages();

    if (this.newPinValue.length !== 4) {
      this.errorMsg = 'Ingresa un PIN de 4 dígitos.';
      return;
    }
    if (this.newPinValue !== this.confirmPinValue) {
      this.errorMsg = 'Los PIN no coinciden.';
      return;
    }

    this.loading = true;
    this.profileService.createPin(this.newPinValue).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'No se pudo crear el PIN.';
          return;
        }
        this.successMsg = 'PIN creado y activado.';
        this.newPinValue = '';
        this.confirmPinValue = '';
        this.refreshProfile();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.strResponseMessage || 'Error de conexión. Intenta de nuevo.';
      },
    });
  }

  askToggle(target: boolean): void {
    this.resetMessages();
    this.toggleTargetValue = target;
    this.togglePinValue = '';
    this.showToggleConfirm = true;
  }

  cancelToggle(): void {
    this.showToggleConfirm = false;
    this.togglePinValue = '';
  }

  confirmToggle(): void {
    if (this.loading) return;
    this.resetMessages();

    if (this.togglePinValue.length !== 4) {
      this.errorMsg = 'Ingresa tu PIN actual.';
      return;
    }

    this.loading = true;
    this.profileService.setPinEnabled(this.togglePinValue, this.toggleTargetValue).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'No se pudo actualizar el PIN.';
          return;
        }
        this.successMsg = this.toggleTargetValue ? 'PIN activado.' : 'PIN desactivado.';
        this.showToggleConfirm = false;
        this.togglePinValue = '';
        this.refreshProfile();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.strResponseMessage || 'Error de conexión. Intenta de nuevo.';
      },
    });
  }

  submitChange(): void {
    if (this.loading) return;
    this.resetMessages();

    if (this.oldPinValue.length !== 4) {
      this.errorMsg = 'Ingresa tu PIN actual.';
      return;
    }
    if (this.changeNewPinValue.length !== 4) {
      this.errorMsg = 'Ingresa el nuevo PIN de 4 dígitos.';
      return;
    }
    if (this.changeNewPinValue !== this.changeConfirmValue) {
      this.errorMsg = 'Los PIN nuevos no coinciden.';
      return;
    }

    this.loading = true;
    this.profileService.changePin(this.oldPinValue, this.changeNewPinValue).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'No se pudo cambiar el PIN.';
          return;
        }
        this.successMsg = 'PIN actualizado correctamente.';
        this.oldPinValue = '';
        this.changeNewPinValue = '';
        this.changeConfirmValue = '';
        this.refreshProfile();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.strResponseMessage || 'Error de conexión. Intenta de nuevo.';
      },
    });
  }
}
