import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AtmosphereComponent }  from '../../shared/components/atmosphere/atmosphere.component';
import { SvgIconComponent }     from '../../shared/components/svg-icons/svg-icon.component';
import { GoldButtonComponent }  from '../../shared/components/gold-button/gold-button.component';
import { AuthHeaderComponent }  from '../components/auth-header/auth-header.component';
import {
  ICON_EYE, ICON_EYE_OFF, ICON_CHECK, ICON_CLOSE_CIRC,
} from '../../shared/icons/icons';

interface Req { key: string; label: string; test: (v: string) => boolean; }

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule,
    AtmosphereComponent, SvgIconComponent, GoldButtonComponent, AuthHeaderComponent,
  ],
  selector: 'app-nueva',
  templateUrl: './nueva.component.html',
  styleUrls: ['./nueva.component.scss'],
})
export class NuevaPage {
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