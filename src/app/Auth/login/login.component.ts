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

  
  form: FormGroup;
  loading = false;

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
    this.loading = true;

    const email = (this.emailCtrl.value || '').trim().toLowerCase();
    const isAdmin = email.includes('admin');

    setTimeout(() => {
      this.loading = false;
      const target = isAdmin ? '/admin' : '/home';
      this.router.navigate([target], { replaceUrl: true });
    }, 1400);
  }




  onSocialPicked(provider: string): void {
    switch (provider) {
      case 'google':
        this.iniciarSesionConGoogle();
        break;
      case 'apple':
        // TODO: implementar inicio de sesión con Apple
        break;
      case 'mail':
        // TODO: enfocar el formulario de correo, etc.
        break;
    }
  }

  async iniciarSesionConGoogle(): Promise<void> {
    const { error } =
      await this.supabaseService.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

    if (error) {
      console.error('Error iniciando sesión:', error);
    }
  }


}




