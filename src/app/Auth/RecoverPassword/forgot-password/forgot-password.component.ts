import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_SHIELD_CHECK } from 'src/app/User/shared/icons/icons';
import { AuthHeaderComponent } from '../../Components/auth-header/auth-header.component';
import { FieldComponent } from '../../Components/field/field.component';

@Component({
  standalone: true,
  imports: [
    IonContent, CommonModule, ReactiveFormsModule,
    AtmosphereComponent, GoldButtonComponent, SvgIconComponent,
    FieldComponent, AuthHeaderComponent,
  ],
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  form: FormGroup;
  iconShield = ICON_SHIELD_CHECK;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get emailCtrl() { return this.form.get('email') as FormControl; }

  goBack()  { this.router.navigate(['/auth/login']); }
  submit()  { this.router.navigate(['/auth/verificar']); }
  goLogin() { this.router.navigate(['/auth/login']); }
}