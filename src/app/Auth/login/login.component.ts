import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { DividerComponent } from 'src/app/User/shared/Components/divider/divider.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SocialRowComponent } from 'src/app/User/shared/Components/social-row/social-row.component';
import { AuthHeaderComponent } from '../Components/auth-header/auth-header.component';
import { FieldComponent } from '../Components/field/field.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_LOCK } from 'src/app/User/shared/icons/icons';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
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
    SvgIconComponent,
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  private readonly supabaseService = inject(SupabaseService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  iconLock = ICON_LOCK;

  form: FormGroup;
  loading = false;
  errorMsg = '';
  blockedMsg = '';
  successMsg = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    // El callback de OAuth redirige aquí con ?blocked=<mensaje> cuando la cuenta
    // está bloqueada; lo mostramos directamente sin que el usuario tenga que hacer nada.
    const blocked = this.route.snapshot.queryParamMap.get('blocked');
    if (blocked) this.blockedMsg = decodeURIComponent(blocked);

    const reset = this.route.snapshot.queryParamMap.get('reset');
    if (reset === '1') this.successMsg = 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.';

    const verified = this.route.snapshot.queryParamMap.get('verified');
    if (verified === '1') this.successMsg = 'Correo verificado. Ya puedes iniciar sesión.';
  }

  get emailCtrl()    { return this.form.get('email')    as FormControl; }
  get passwordCtrl() { return this.form.get('password') as FormControl; }

  goBack()     { this.router.navigate(['/welcome'], { replaceUrl: true }); }
  goRegister() { this.router.navigate(['/auth/register']); }
  goHome()     { this.router.navigate(['/home'], { replaceUrl: true }); }

  goForgot(): void {
    const email = (this.emailCtrl.value || '').trim();
    if (!email) {
      this.errorMsg = 'Ingresa tu correo electrónico antes de continuar.';
      return;
    }

    this.errorMsg = '';
    this.blockedMsg = '';
    this.loading = true;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/recuperar'], { queryParams: { email } });
      },
      error: () => {
        this.loading = false;
        // Navegar igual — el backend no revela si el correo existe
        this.router.navigate(['/auth/recuperar'], { queryParams: { email } });
      },
    });
  }

  submit() {
    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = this.mapFormError();
      return;
    }

    this.errorMsg = '';
    this.blockedMsg = '';
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
        this.router.navigate([this.authService.getPostLoginRoute(res.returnValue!)], { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        const body = err?.error;
        if (body?.strResponseTittle === 'Cuenta bloqueada') {
          this.blockedMsg = body.strResponseMessage;
          return;
        }
        if (body?.strResponseTittle === 'Email no verificado') {
          const email = (this.emailCtrl.value || '').trim().toLowerCase();
          this.router.navigate(['/auth/verificar-email'], { queryParams: { email, unverified: '1' } });
          return;
        }
        if (body?.strResponseTittle === '2FA requerido') {
          const email = (this.emailCtrl.value || '').trim().toLowerCase();
          this.router.navigate(['/auth/verificar-2fa'], { queryParams: { email } });
          return;
        }
        if (body?.strResponseTittle === 'Credenciales inválidas' || err?.status === 401) {
          this.errorMsg = 'Correo electrónico o contraseña incorrectos.';
          return;
        }
        this.errorMsg = this.mapLoginError(body?.strResponseMessage, err?.status);
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

    if (esCorreoNoRegistrado) {
      return 'El correo electrónico no ha sido registrado. Selecciona la opción "REGISTRARSE" para crear una cuenta.';
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
    this.loading = true;

    // En la app nativa no hay un origen público al que Google/Supabase puedan
    // redirigir de vuelta, así que se abre un navegador in-app y se vuelve por
    // un deep link (ver AppComponent) en vez de navegar dentro del WebView.
    if (Capacitor.isNativePlatform()) {
      const { data, error } = await this.supabaseService.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'com.biozinroyale.app://auth/callback',
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        console.error(`Error iniciando sesión con ${provider}:`, error);
        this.loading = false;
        this.errorMsg = this.mapLoginError(error?.message);
        return;
      }

      await Browser.open({ url: data.url });
      return;
    }

    const { error } =
      await this.supabaseService.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

    if (error) {
      console.error(`Error iniciando sesión con ${provider}:`, error);
      this.loading = false;
      this.errorMsg = this.mapLoginError(error.message);
    }
  }


}




