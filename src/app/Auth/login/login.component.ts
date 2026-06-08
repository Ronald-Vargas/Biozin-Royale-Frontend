import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent }  from '../../shared/components/atmosphere/atmosphere.component';
import { GoldButtonComponent }  from '../../shared/components/gold-button/gold-button.component';
import { DividerComponent }     from '../../shared/components/divider/divider.component';
import { SocialRowComponent }   from '../../shared/components/social-row/social-row.component';
import { FieldComponent }       from '../components/field/field.component';
import { AuthHeaderComponent }  from '../components/auth-header/auth-header.component';

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
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
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
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/home'], { replaceUrl: true });
    }, 1400);
  }
}
