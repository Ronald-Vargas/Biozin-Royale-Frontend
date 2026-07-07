import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ICON_MAIL, ICON_KEYPAD } from 'src/app/User/shared/icons/icons';

@Component({
  standalone: true,
  imports: [IonContent, CommonModule, ReactiveFormsModule, AtmosphereComponent, SvgIconComponent],
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
  iconMail   = ICON_MAIL;
  iconKeypad = ICON_KEYPAD;

  email = '';
  form: FormGroup;

  loading     = false;
  loadingCode = false;
  errorMsg    = '';
  codeResent  = false;
  unverifiedAlert = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  get codeCtrl() { return this.form.get('code') as FormControl; }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (!this.email) this.router.navigate(['/auth/login'], { replaceUrl: true });

    const unverified = this.route.snapshot.queryParamMap.get('unverified');
    if (unverified === '1') this.unverifiedAlert = true;
  }

  resendCode(): void {
    if (this.loadingCode) return;
    this.loadingCode = true;
    this.codeResent = false;
    this.errorMsg = '';

    this.authService.resendVerification(this.email).subscribe({
      next:  () => { this.loadingCode = false; this.codeResent = true; setTimeout(() => this.codeResent = false, 4000); },
      error: () => { this.loadingCode = false; this.codeResent = true; setTimeout(() => this.codeResent = false, 4000); },
    });
  }

  submit(): void {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.codeCtrl.errors?.['required']) {
        this.errorMsg = 'Ingresa el código de verificación.';
      } else {
        this.errorMsg = 'El código debe tener exactamente 6 dígitos.';
      }
      return;
    }

    this.errorMsg = '';
    this.loading = true;

    this.authService.verifyEmail(this.email, this.codeCtrl.value.trim()).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError) {
          this.errorMsg = res.strResponseMessage || 'No se pudo verificar el correo.';
          return;
        }
        this.router.navigate(['/auth/login'], {
          replaceUrl: true,
          queryParams: { verified: '1' },
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.strResponseMessage || 'Código inválido o expirado. Solicita uno nuevo.';
      },
    });
  }

  goBack(): void { this.router.navigate(['/auth/login']); }
}
