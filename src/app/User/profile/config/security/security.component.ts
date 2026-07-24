import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_LOCK_FILLED, ICON_KEYPAD, ICON_EDIT, ICON_SHIELD, ICON_DOTS_VERT, ICON_TRASH, ICON_PHONE, ICON_TABLET, ICON_LOGIN, ICON_KEY, ICON_ARROW_UP } from 'src/app/User/shared/icons/icons';
import { SecCardComponent, SecLine } from './components/sec-card/sec-card.component';
import { SectionHeadSecComponent } from './components/section-head-sec/section-head-sec.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ProfileService } from 'src/app/Core/Services/profile.service';

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
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
})
export class SecurityComponent implements OnInit {
  iconLock    = ICON_LOCK_FILLED;
  iconKeypad  = ICON_KEYPAD;
  iconEdit    = ICON_EDIT;
  iconShield  = ICON_SHIELD;
  iconDots    = ICON_DOTS_VERT;
  iconTrash   = ICON_TRASH;

  get hasPassword(): boolean {
    return this.authService.currentProfile()?.hasPassword ?? true;
  }

  // Líneas de cada SecCard
  get passLines(): SecLine[] {
    if (!this.hasPassword) {
      return [{ label: 'Iniciaste sesión con Google, no tienes contraseña configurada.' }];
    }
    return [
      { label: 'Última actualización:' },
      { label: 'Hace 45 días', strong: true },
    ];
  }

  get twoFaEnabled(): boolean {
    return this.authService.currentProfile()?.twoFactorEnabled ?? false;
  }

  get twoFaLines(): SecLine[] {
    return this.twoFaEnabled
      ? [
          { label: 'Estado: ', value: 'Activado', valueColor: '#4fd190', dot: true },
          { label: 'Se envía un código a tu correo en cada inicio de sesión.' },
        ]
      : [{ label: 'Estado: ', value: 'Desactivado', valueColor: '#e06a6a', dot: true }];
  }

  get twoFaBtnLabel(): string {
    return this.twoFaEnabled ? 'Gestionar 2FA' : 'Activar 2FA';
  }

  get hasPin(): boolean {
    return this.authService.currentProfile()?.hasPin ?? false;
  }

  get pinEnabled(): boolean {
    return this.authService.currentProfile()?.pinEnabled ?? false;
  }

  get pinLines(): SecLine[] {
    if (!this.hasPin) {
      return [{ label: 'Usado para retiros y cambios importantes en la cuenta' }];
    }
    return this.pinEnabled
      ? [{ label: 'Estado: ', value: 'Activado', valueColor: '#4fd190', dot: true }]
      : [{ label: 'Estado: ', value: 'Desactivado', valueColor: '#e06a6a', dot: true }];
  }

  get pinBtnLabel(): string {
    return this.hasPin ? 'Gestionar PIN' : 'Configurar PIN';
  }

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    // Refresca el perfil cacheado para que `hasPassword` refleje el dato real,
    // ya que sesiones guardadas antes de este campo no lo traen.
    this.profileService.getProfile().subscribe();
  }

  goBack()      { this.router.navigate(['/config']); }
  changePass()  { if (this.hasPassword) this.router.navigate(['/seguridad/cambiar-contrasena']); }
  manage2FA()   { this.router.navigate(['/seguridad/2fa']); }
  changePin()   { this.router.navigate(['/seguridad/pin']); }
  closeAll()    { /* placeholder */ }
}