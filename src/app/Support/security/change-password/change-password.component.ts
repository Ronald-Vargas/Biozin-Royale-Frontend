import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { SupportNavComponent } from '../../shared/support-nav/support-nav.component';
import { FieldComponent } from 'src/app/Auth/Components/field/field.component';
import { StaffService } from 'src/app/Core/Services/staff.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AtmosphereComponent, AdminHeaderComponent, SupportNavComponent, FieldComponent],
  selector: 'app-support-security-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class SupportSecurityChangePasswordComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private staffService: StaffService,
  ) {
    this.form = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordsMatch });
  }

  get oldPasswordCtrl()     { return this.form.get('oldPassword')     as FormControl; }
  get newPasswordCtrl()     { return this.form.get('newPassword')     as FormControl; }
  get confirmPasswordCtrl() { return this.form.get('confirmPassword') as FormControl; }

  goBack() { this.router.navigate(['/soporte/seguridad']); }

  submit(): void {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = this.mapFormError();
      this.successMsg = '';
      return;
    }
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = true;

    const oldPassword = this.oldPasswordCtrl.value;
    const newPassword = this.newPasswordCtrl.value;

    this.staffService.changePassword(oldPassword, newPassword).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'No se pudo cambiar la contraseña.';
          return;
        }
        this.successMsg = 'Tu contraseña se actualizó correctamente.';
        this.form.reset();
      },
      error: (err) => {
        this.loading = false;
        const body = err?.error;
        this.errorMsg = body?.strResponseMessage || 'Error de conexión. Intenta de nuevo.';
      },
    });
  }

  private passwordsMatch(group: FormGroup) {
    const nueva = group.get('newPassword')?.value;
    const confirma = group.get('confirmPassword')?.value;
    if (nueva && confirma && nueva !== confirma) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  private mapFormError(): string {
    if (this.oldPasswordCtrl.errors?.['required'])     return 'Ingresa tu contraseña actual.';
    if (this.newPasswordCtrl.errors?.['required'])     return 'Ingresa la nueva contraseña.';
    if (this.newPasswordCtrl.errors?.['minlength'])    return 'La nueva contraseña debe tener al menos 8 caracteres.';
    if (this.confirmPasswordCtrl.errors?.['required']) return 'Confirma la nueva contraseña.';
    if (this.confirmPasswordCtrl.errors?.['mismatch']) return 'Las contraseñas no coinciden.';
    return 'Revisa los campos del formulario.';
  }
}
