import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonCheckbox } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { DividerComponent } from 'src/app/User/shared/Components/divider/divider.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SocialRowComponent } from 'src/app/User/shared/Components/social-row/social-row.component';
import { AuthHeaderComponent } from '../Components/auth-header/auth-header.component';
import { FieldComponent } from '../Components/field/field.component';
import { AuthService } from 'src/app/Core/Services/auth.service';

@Component({
  standalone: true,
  imports: [
    IonContent, IonCheckbox,
    CommonModule,
    ReactiveFormsModule,
    AtmosphereComponent,
    GoldButtonComponent,
    DividerComponent,
    SocialRowComponent,
    FieldComponent,
    AuthHeaderComponent,
  ],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})

export class RegisterComponent {
  private readonly authService = inject(AuthService);

  form: FormGroup;
  loading = false;
  agree   = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      name:    ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      phone:   ['', Validators.required],
      pass:    ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    });
  }

  get nameCtrl()    { return this.form.get('name')    as FormControl; }
  get emailCtrl()   { return this.form.get('email')   as FormControl; }
  get phoneCtrl()   { return this.form.get('phone')   as FormControl; }
  get passCtrl()    { return this.form.get('pass')    as FormControl; }
  get confirmCtrl() { return this.form.get('confirm') as FormControl; }

  goBack()  { this.router.navigate(['/welcome'], { replaceUrl: true }); }
  goLogin() { this.router.navigate(['/auth/login']); }
  goHome()  { this.router.navigate(['/home'], { replaceUrl: true }); }

  submit() {
    if (this.loading) return;

    if (!this.agree) {
      this.errorMsg = 'Debes aceptar los Términos y Condiciones.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Revisa los campos del formulario.';
      return;
    }

    this.errorMsg = '';
    this.loading = true;

    const { name, email, phone, pass, confirm } = this.form.value;

    this.authService
      .register({ nombre: name, email, phone, password: pass, confirm })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.blnError) {
            this.errorMsg = res.strResponseMessage || 'No se pudo completar el registro.';
            return;
          }
          const faltanDatos = !!res.returnValue?.camposPendientes?.length;
          this.router.navigate([faltanDatos ? '/miperfil' : '/home'], { replaceUrl: true });
        },
        error: () => {
          this.loading = false;
          this.errorMsg = 'No se pudo conectar con el servidor. Intenta de nuevo.';
        },
      });
  }
}