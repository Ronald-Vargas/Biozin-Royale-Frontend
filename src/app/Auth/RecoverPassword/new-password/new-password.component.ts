import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_EYE, ICON_EYE_OFF, ICON_CHECK, ICON_CLOSE_CIRC } from 'src/app/User/shared/icons/icons';
import { AuthHeaderComponent } from '../../Components/auth-header/auth-header.component';


interface Req { key: string; label: string; test: (v: string) => boolean; }

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule,
    AtmosphereComponent, SvgIconComponent, GoldButtonComponent, AuthHeaderComponent,
  ],
  selector: 'app-new-password.component',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
})
export class NewPasswordComponent {
  pw      = '';
  confirm = '';

  showPw      = false;
  showConfirm = false;
  focusPw      = false;
  focusConfirm = false;

  iconEye      = ICON_EYE;
  iconEyeOff   = ICON_EYE_OFF;
  iconCheck    = ICON_CHECK;
  iconClose    = ICON_CLOSE_CIRC;

  reqs: Req[] = [
    { key: 'len',   label: 'Mínimo 8 caracteres',          test: v => v.length >= 8 },
    { key: 'upper', label: 'Al menos 1 mayúscula',         test: v => /[A-Z]/.test(v) },
    { key: 'num',   label: 'Al menos 1 número',            test: v => /[0-9]/.test(v) },
    { key: 'spec',  label: 'Al menos 1 carácter especial', test: v => /[^A-Za-z0-9]/.test(v) },
  ];

  constructor(private router: Router) {}

  results(): boolean[] { return this.reqs.map(r => r.test(this.pw)); }
  get allOk(): boolean { return this.results().every(Boolean); }
  get match(): boolean { return this.confirm.length > 0 && this.pw === this.confirm; }
  get ready(): boolean { return this.allOk && this.match; }

  goBack()  { this.router.navigate(['/auth/verificar']); }
  goLogin() { this.router.navigate(['/auth/login']); }

  submit() {
    if (this.ready) this.router.navigate(['/auth/actualizada']);
  }
}