import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonCheckbox } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Browser } from '@capacitor/browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { DividerComponent } from 'src/app/User/shared/Components/divider/divider.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SocialRowComponent } from 'src/app/User/shared/Components/social-row/social-row.component';
import { AuthHeaderComponent } from '../Components/auth-header/auth-header.component';
import { FieldComponent } from '../Components/field/field.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { SupabaseService } from 'src/app/Core/Services/supabase.service';

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
  private readonly supabaseService = inject(SupabaseService);

  private readonly termsUrl = 'https://bjimenez867.github.io/biozin-pages/terms.html';

  form: FormGroup;
  loading = false;
  agree   = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private router: Router, route: ActivatedRoute) {
    this.form = this.fb.group({
      name:    ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      phone:   ['', Validators.required],
      pass:    ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    });

    // El guard de cuentas reales manda acá con ?motivo=invitado cuando un
    // invitado intenta entrar a una pantalla que requiere cuenta real.
    if (route.snapshot.queryParamMap.get('motivo') === 'invitado') {
      this.errorMsg = 'Crea una cuenta para depositar, retirar o apostar.';
    }
  }

  get nameCtrl()    { return this.form.get('name')    as FormControl; }
  get emailCtrl()   { return this.form.get('email')   as FormControl; }
  get phoneCtrl()   { return this.form.get('phone')   as FormControl; }
  get passCtrl()    { return this.form.get('pass')    as FormControl; }
  get confirmCtrl() { return this.form.get('confirm') as FormControl; }

  goBack()     { this.router.navigate(['/welcome'], { replaceUrl: true }); }
  goLogin()    { this.router.navigate(['/auth/login']); }
  goTerminos() { Browser.open({ url: this.termsUrl }); }

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
      this.errorMsg = error.message || 'No se pudo conectar con el servidor. Intenta de nuevo.';
    }
  }

  submit() {
    if (this.loading) return;

    if (!this.agree) {
      this.errorMsg = 'Debes aceptar los Términos y Condiciones.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = this.mapFormError();
      return;
    }

    if (this.passCtrl.value !== this.confirmCtrl.value) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.errorMsg = '';
    this.loading = true;

    const { name, phone, pass, confirm } = this.form.value;
    const email = (this.emailCtrl.value || '').trim().toLowerCase();
    const datos = { nombre: name, email, phone, password: pass, confirm };

    // Si ya estaba como invitado, esto reclama ese mismo perfil (y su saldo) en
    // vez de crear una cuenta nueva desde cero.
    const esInvitado = this.authService.currentProfile()?.isGuest;
    const peticion = esInvitado ? this.authService.claimGuest(datos) : this.authService.register(datos);

    peticion.subscribe({
        next: (res) => {
          this.loading = false;
          if (res.blnError || !res.returnValue) {
            this.errorMsg = this.mapRegisterError(res.strResponseMessage);
            return;
          }
          if (res.returnValue.mustVerifyEmail) {
            const emailParam = (this.emailCtrl.value || '').trim().toLowerCase();
            this.router.navigate(['/auth/verificar-email'], { replaceUrl: true, queryParams: { email: emailParam } });
            return;
          }
          this.router.navigate([this.authService.getPostLoginRoute(res.returnValue)], { replaceUrl: true });
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = this.mapRegisterError(err?.error?.strResponseMessage, err?.status);
        },
      });
  }

  private mapFormError(): string {
    const n = this.nameCtrl.errors;
    const e = this.emailCtrl.errors;
    const p = this.phoneCtrl.errors;
    const s = this.passCtrl.errors;
    const c = this.confirmCtrl.errors;

    if (n?.['required'] && e?.['required'] && p?.['required'] && s?.['required'] && c?.['required']) {
      return 'Completa todos los campos para registrarte.';
    }
    if (n?.['required']) return 'El nombre completo es requerido.';
    if (e?.['required']) return 'El correo electrónico es requerido.';
    if (e?.['email'])    return 'El correo electrónico no tiene un formato válido.';
    if (p?.['required']) return 'El número de teléfono es requerido.';
    if (s?.['required']) return 'La contraseña es requerida.';
    if (s?.['minlength']) return 'La contraseña debe tener al menos 8 caracteres.';
    if (c?.['required']) return 'Debes confirmar tu contraseña.';
    return 'Revisa los campos del formulario.';
  }

  private mapRegisterError(message?: string, status?: number): string {
    const msg = (message ?? '').toLowerCase();

    const esCorreoExistente =
      status === 409 ||
      msg.includes('already exists') ||
      msg.includes('ya existe') ||
      msg.includes('ya registrado') ||
      msg.includes('already registered') ||
      msg.includes('duplicate') ||
      msg.includes('email');

    const esContrasenaNoCoincide =
      msg.includes('coincide') ||
      msg.includes('match') ||
      msg.includes('confirm');

    if (esCorreoExistente) {
      return 'El correo electrónico ya está registrado. Selecciona la opción "INICIAR SESIÓN" para acceder a tu cuenta.';
    }
    if (esContrasenaNoCoincide) {
      return 'Las contraseñas no coinciden.';
    }
    return message || 'No se pudo conectar con el servidor. Intenta de nuevo.';
  }
}