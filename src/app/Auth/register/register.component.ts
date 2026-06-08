import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonCheckbox } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AtmosphereComponent } from '../../shared/components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from '../../shared/components/gold-button/gold-button.component';
import { DividerComponent }    from '../../shared/components/divider/divider.component';
import { SocialRowComponent }  from '../../shared/components/social-row/social-row.component';
import { FieldComponent }      from '../components/field/field.component';
import { AuthHeaderComponent } from '../components/auth-header/auth-header.component';

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
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  form: FormGroup;
  loading = false;
  agree   = false;

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
    if (this.loading || !this.agree) return;
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/home'], { replaceUrl: true });
    }, 1500);
  }
}