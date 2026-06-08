import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent } from '../../shared/components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from '../../shared/components/gold-button/gold-button.component';
import { SvgIconComponent }    from '../../shared/components/svg-icons/svg-icon.component';
import { FieldComponent }      from '../components/field/field.component';
import { AuthHeaderComponent } from '../components/auth-header/auth-header.component';
import { ICON_SHIELD_CHECK }   from '../../shared/icons/icons';

@Component({
  standalone: true,
  imports: [
    IonContent, CommonModule, ReactiveFormsModule,
    AtmosphereComponent, GoldButtonComponent, SvgIconComponent,
    FieldComponent, AuthHeaderComponent,
  ],
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss'],
})
export class ForgotPage {
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