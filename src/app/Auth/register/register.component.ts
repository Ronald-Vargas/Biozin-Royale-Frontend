import { Component } from '@angular/core';
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
  selector: 'app-register.component',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})

export class RegisterComponent {
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