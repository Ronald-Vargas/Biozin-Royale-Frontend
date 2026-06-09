import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_LOCK_FILLED, ICON_KEYPAD, ICON_EDIT, ICON_SHIELD, ICON_DOTS_VERT, ICON_TRASH, ICON_PHONE, ICON_TABLET, ICON_LOGIN, ICON_KEY, ICON_ARROW_UP } from 'src/app/User/shared/icons/icons';
import { SecCardComponent, SecLine } from './components/sec-card/sec-card.component';
import { SectionHeadSecComponent } from './components/section-head-sec/section-head-sec.component';

interface Session {
  device: string;
  icon:   string;
  loc:    string;
  ip:     string;
  when:   string;
  active: boolean;
}

interface HistEntry {
  label: string;
  date:  string;
  icon:  string;
  color: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, ScreenShellComponent, SvgIconComponent,
    SecCardComponent, SectionHeadSecComponent,
  ],
  selector: 'app-seguridad',
  templateUrl: './seguridad.component.html',
  styleUrls: ['./seguridad.component.scss'],
})
export class SeguridadPage {
  iconLock    = ICON_LOCK_FILLED;
  iconKeypad  = ICON_KEYPAD;
  iconEdit    = ICON_EDIT;
  iconShield  = ICON_SHIELD;
  iconDots    = ICON_DOTS_VERT;
  iconTrash   = ICON_TRASH;

  // Líneas de cada SecCard
  passLines: SecLine[] = [
    { label: 'Última actualización:' },
    { label: 'Hace 45 días', strong: true },
  ];

  twoFaLines: SecLine[] = [
    { label: 'Estado: ', value: 'Activado', valueColor: '#4fd190', dot: true },
    { label: 'Aplicación: Google Authenticator' },
  ];

  pinLines: SecLine[] = [
    { label: 'Usado para retiros y cambios importantes en la cuenta' },
  ];

  sessions: Session[] = [
    {
      device: 'iPhone 15 Pro',
      icon:   ICON_PHONE,
      loc:    'San José, Costa Rica',
      ip:     '186.3.80.121',
      when:   'Activo ahora',
      active: true,
    },
    {
      device: 'iPad',
      icon:   ICON_TABLET,
      loc:    'Alajuela, Costa Rica',
      ip:     '186.3.90.55',
      when:   'Hace 2 horas',
      active: false,
    },
  ];

  history: HistEntry[] = [
    { label: 'Inicio de sesión',     date: '21 mayo · 09:41 a.m.', icon: ICON_LOGIN,    color: '#4fd190' },
    { label: 'Cambio de contraseña', date: '18 mayo · 04:22 p.m.', icon: ICON_KEY,      color: 'var(--gold-1)' },
    { label: 'Retiro realizado',     date: '10 mayo · 08:30 p.m.', icon: ICON_ARROW_UP, color: 'var(--gold-1)' },
  ];

  constructor(private router: Router) {}

  goBack()      { this.router.navigate(['/config']); }
  changePass()  { /* placeholder */ }
  manage2FA()   { /* placeholder */ }
  changePin()   { /* placeholder */ }
  closeAll()    { /* placeholder */ }
}