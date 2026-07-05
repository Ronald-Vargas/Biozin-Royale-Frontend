import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { FieldComponent } from 'src/app/Auth/Components/field/field.component';
import { StaffService } from 'src/app/Core/Services/staff.service';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ICON_LOCK, ICON_SHIELD } from 'src/app/User/shared/icons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AtmosphereComponent, SvgIconComponent, FieldComponent],
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  iconLock   = ICON_LOCK;
  iconShield = ICON_SHIELD;

  form: FormGroup;
  loading  = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private staffService: StaffService,
    private authService: AuthService,
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

  get perfil() { return this.authService.currentProfile(); }

  ngOnInit(): void {
    // Si llegó aquí pero ya no necesita cambiar la contraseña, redirigir
    if (this.perfil && !this.perfil.mustChangePassword) {
      this.router.navigate([this.authService.getPostLoginRoute(this.perfil)], { replaceUrl: true });
    }
  }

  submit(): void {
    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = this.mapFormError();
      return;
    }

    this.errorMsg = '';
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
        // Actualizar el perfil guardado para que mustChangePassword quede en false
        const currentPerfil = this.perfil;
        if (currentPerfil) {
          const updated = { ...currentPerfil, mustChangePassword: false };
          this.authService.storeSession({ blnError: false, returnValue: updated, strResponseMessage: '', strResponseTittle: '' });
        }
        const destino = this.perfil?.role === 'soporte' ? '/support' : '/admin';
        this.router.navigate([destino], { replaceUrl: true });
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
