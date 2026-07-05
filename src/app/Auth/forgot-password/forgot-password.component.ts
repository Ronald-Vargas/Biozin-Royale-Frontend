import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { FieldComponent } from '../Components/field/field.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ICON_LOCK, ICON_MAIL, ICON_KEYPAD } from 'src/app/User/shared/icons/icons';

@Component({
  standalone: true,
  imports: [IonContent, CommonModule, ReactiveFormsModule, AtmosphereComponent, SvgIconComponent, FieldComponent],
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  iconLock   = ICON_LOCK;
  iconMail   = ICON_MAIL;
  iconKeypad = ICON_KEYPAD;

  email = '';
  form: FormGroup;

  loadingCode = false;   // enviando nuevo código
  loading     = false;   // enviando reset
  errorMsg    = '';
  codeResent  = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      code:           ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword:    ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword:['', [Validators.required]],
    }, { validators: this.passwordsMatch });
  }

  get codeCtrl()            { return this.form.get('code')            as FormControl; }
  get newPasswordCtrl()     { return this.form.get('newPassword')     as FormControl; }
  get confirmPasswordCtrl() { return this.form.get('confirmPassword') as FormControl; }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (!this.email) this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  resendCode(): void {
    if (this.loadingCode) return;
    this.loadingCode = true;
    this.codeResent = false;
    this.errorMsg = '';

    this.authService.forgotPassword(this.email).subscribe({
      next:  () => { this.loadingCode = false; this.codeResent = true; setTimeout(() => this.codeResent = false, 4000); },
      error: () => { this.loadingCode = false; this.codeResent = true; setTimeout(() => this.codeResent = false, 4000); },
    });
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

    this.authService.resetPassword(this.email, this.codeCtrl.value.trim(), this.newPasswordCtrl.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'No se pudo restablecer la contraseña.';
          return;
        }
        this.router.navigate(['/auth/login'], {
          replaceUrl: true,
          queryParams: { reset: '1' },
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.strResponseMessage || 'Error de conexión. Intenta de nuevo.';
      },
    });
  }

  goBack(): void { this.router.navigate(['/auth/login']); }

  private passwordsMatch(group: FormGroup) {
    const nueva    = group.get('newPassword')?.value;
    const confirma = group.get('confirmPassword')?.value;
    if (nueva && confirma && nueva !== confirma) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  private mapFormError(): string {
    if (this.codeCtrl.errors?.['required'])           return 'Ingresa el código de recuperación.';
    if (this.codeCtrl.errors?.['minlength'] || this.codeCtrl.errors?.['maxlength']) return 'El código debe tener 6 dígitos.';
    if (this.newPasswordCtrl.errors?.['required'])    return 'Ingresa la nueva contraseña.';
    if (this.newPasswordCtrl.errors?.['minlength'])   return 'La contraseña debe tener al menos 8 caracteres.';
    if (this.confirmPasswordCtrl.errors?.['required']) return 'Confirma la nueva contraseña.';
    if (this.confirmPasswordCtrl.errors?.['mismatch']) return 'Las contraseñas no coinciden.';
    return 'Revisa los campos del formulario.';
  }
}
