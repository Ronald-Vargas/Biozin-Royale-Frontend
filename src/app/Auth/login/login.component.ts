import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { DividerComponent } from 'src/app/User/shared/Components/divider/divider.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SocialRowComponent } from 'src/app/User/shared/Components/social-row/social-row.component';
import { AuthHeaderComponent } from '../Components/auth-header/auth-header.component';
import { FieldComponent } from '../Components/field/field.component';
import { SupabaseService } from 'src/app/Core/Services/supabase.service';
import { AuthService } from 'src/app/Core/Services/auth.service';

@Component({
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    ReactiveFormsModule,
    AtmosphereComponent,
    GoldButtonComponent,
    DividerComponent,
    SocialRowComponent,
    FieldComponent,
    AuthHeaderComponent,
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  private readonly supabaseService = inject(SupabaseService);
  private readonly authService = inject(AuthService);

  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get emailCtrl()    { return this.form.get('email')    as FormControl; }
  get passwordCtrl() { return this.form.get('password') as FormControl; }

  goBack()     { this.router.navigate(['/welcome'], { replaceUrl: true }); }
  goForgot()   { this.router.navigate(['/auth/forgot']); }
  goRegister() { this.router.navigate(['/auth/register']); }
  goHome()     { this.router.navigate(['/home'], { replaceUrl: true }); }

  submit() {
    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = this.mapFormError();
      return;
    }

    this.errorMsg = '';
    this.loading = true;

    const email = (this.emailCtrl.value || '').trim().toLowerCase();
    const password = this.passwordCtrl.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError) {
          this.errorMsg = this.mapLoginError(res.strResponseMessage);
          return;
        }
        const faltanDatos = !!res.returnValue?.camposPendientes?.length;
        this.router.navigate([faltanDatos ? '/miperfil' : '/home'], { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = this.mapLoginError(err?.error?.strResponseMessage, err?.status);
      },
    });
  }

  private mapFormError(): string {
    const emailErr    = this.emailCtrl.errors;
    const passwordErr = this.passwordCtrl.errors;

    if (emailErr?.['required'] && passwordErr?.['required']) {
      return 'Ingresa tu correo electrónico y contraseña.';
    }
    if (emailErr?.['required']) {
      return 'El correo electrónico es requerido.';
    }
    if (emailErr?.['email']) {
      return 'El correo electrónico no tiene un formato válido.';
    }
    if (passwordErr?.['required']) {
      return 'La contraseña es requerida.';
    }
    if (passwordErr?.['minlength']) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    return 'Revisa los campos del formulario.';
  }

  private mapLoginError(message?: string, status?: number): string {
    const msg = (message ?? '').toLowerCase();

    const esCorreoNoRegistrado =
      status === 404 ||
      msg.includes('not found') ||
      msg.includes('no encontrado') ||
      msg.includes('no registrado') ||
      msg.includes('no existe') ||
      msg.includes('user not found') ||
      msg.includes('email not found');

    const esContrasenaIncorrecta =
      (!esCorreoNoRegistrado && status === 401) ||
      msg.includes('password') ||
      msg.includes('contraseña') ||
      msg.includes('incorrect') ||
      msg.includes('inválid');

    if (esCorreoNoRegistrado) {
      return 'El correo electrónico no ha sido registrado. Selecciona la opción "REGISTRARSE" para crear una cuenta.';
    }

    if (esContrasenaIncorrecta) {
      return 'Contraseña incorrecta.';
    }

    return message || 'No se pudo conectar con el servidor. Intenta de nuevo.';
  }




  onSocialPicked(provider: string): void {
    switch (provider) {
      case 'google':
        this.iniciarSesionConOAuth('google');
        break;
      case 'facebook':
        this.iniciarSesionConOAuth('facebook');
        break;
      case 'mail':
        break;
    }
  }

  async iniciarSesionConOAuth(provider: 'google' | 'facebook'): Promise<void> {
    const { error } =
      await this.supabaseService.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

    if (error) {
      console.error(`Error iniciando sesión con ${provider}:`, error);
    }
  }


}




