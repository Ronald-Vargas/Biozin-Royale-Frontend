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

  askToggle(target: boolean): void {
    this.resetMessages();
    this.toggleTargetValue = target;
    this.passwordCtrl.reset();
    this.showToggleConfirm = true;
  }

  cancelToggle(): void {
    this.showToggleConfirm = false;
    this.passwordCtrl.reset();
  }

  confirmToggle(): void {
    if (this.loading) return;
    this.resetMessages();

    if (this.hasPassword && this.passwordCtrl.invalid) {
      this.passwordCtrl.markAsTouched();
      this.errorMsg = 'Ingresa tu contraseña actual.';
      return;
    }

    this.loading = true;
    this.profileService.setTwoFactorEnabled(this.passwordCtrl.value ?? '', this.toggleTargetValue).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'No se pudo actualizar la autenticación en dos pasos.';
          return;
        }
        this.successMsg = this.toggleTargetValue ? 'Autenticación en dos pasos activada.' : 'Autenticación en dos pasos desactivada.';
        this.showToggleConfirm = false;
        this.passwordCtrl.reset();
        this.refreshProfile();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.strResponseMessage || 'Error de conexión. Intenta de nuevo.';
      },
    });
  }
}
