import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { FieldComponent } from 'src/app/Auth/Components/field/field.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ProfileService } from 'src/app/Core/Services/profile.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScreenShellComponent, ToggleComponent, FieldComponent],
  selector: 'app-manage-two-factor',
  templateUrl: './manage-two-factor.component.html',
  styleUrls: ['./manage-two-factor.component.scss'],
})
export class ManageTwoFactorComponent implements OnInit {
  loading    = false;
  errorMsg   = '';
  successMsg = '';

  showToggleConfirm = false;
  toggleTargetValue = false;
  passwordCtrl = new FormControl('', [Validators.required]);
  codeCtrl = new FormControl('', [Validators.required]);

  sendingCode = false;
  codeSent = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe();
  }

  get twoFaEnabled(): boolean { return this.authService.currentProfile()?.twoFactorEnabled ?? false; }
  get hasPassword(): boolean { return this.authService.currentProfile()?.hasPassword ?? true; }

  goBack(): void { this.router.navigate(['/seguridad']); }

  private resetMessages(): void {
    this.errorMsg = '';
    this.successMsg = '';
  }

  private refreshProfile(): void {
    this.profileService.getProfile().subscribe({ next: () => {}, error: () => {} });
  }

  get needsCode(): boolean {
    return !this.toggleTargetValue && this.twoFaEnabled && !this.hasPassword;
  }

  askToggle(target: boolean): void {
    this.resetMessages();
    this.toggleTargetValue = target;
    this.passwordCtrl.reset();
    this.codeCtrl.reset();
    this.codeSent = false;
    this.showToggleConfirm = true;

    if (this.needsCode) {
      this.sendCode();
    }
  }

  cancelToggle(): void {
    this.showToggleConfirm = false;
    this.passwordCtrl.reset();
    this.codeCtrl.reset();
    this.codeSent = false;
  }

  sendCode(): void {
    if (this.sendingCode) return;
    this.resetMessages();
    this.sendingCode = true;
    this.profileService.sendTwoFactorDisableCode().subscribe({
      next: (res) => {
        this.sendingCode = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'No se pudo enviar el código a tu correo.';
          return;
        }
        this.codeSent = true;
        this.successMsg = 'Te enviamos un código de verificación a tu correo.';
      },
      error: (err) => {
        this.sendingCode = false;
        this.errorMsg = err?.error?.strResponseMessage || 'Error de conexión. Intenta de nuevo.';
      },
    });
  }

  confirmToggle(): void {
    if (this.loading) return;
    this.resetMessages();

    if (this.hasPassword && this.passwordCtrl.invalid) {
      this.passwordCtrl.markAsTouched();
      this.errorMsg = 'Ingresa tu contraseña actual.';
      return;
    }

    if (this.needsCode && this.codeCtrl.invalid) {
      this.codeCtrl.markAsTouched();
      this.errorMsg = 'Ingresa el código que enviamos a tu correo.';
      return;
    }

    this.loading = true;
    this.profileService
      .setTwoFactorEnabled(this.passwordCtrl.value ?? '', this.toggleTargetValue, this.needsCode ? (this.codeCtrl.value ?? '') : undefined)
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.blnError) {
            this.errorMsg = res.strResponseMessage || 'No se pudo actualizar la autenticación en dos pasos.';
            return;
          }
          this.successMsg = this.toggleTargetValue ? 'Autenticación en dos pasos activada.' : 'Autenticación en dos pasos desactivada.';
          this.showToggleConfirm = false;
          this.passwordCtrl.reset();
          this.codeCtrl.reset();
          this.codeSent = false;
          this.refreshProfile();
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err?.error?.strResponseMessage || 'Error de conexión. Intenta de nuevo.';
        },
      });
  }
}
