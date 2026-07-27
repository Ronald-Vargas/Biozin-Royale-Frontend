import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from 'src/app/User/shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_LOCK_FILLED, ICON_KEYPAD, ICON_EDIT, ICON_SHIELD, ICON_TRASH } from 'src/app/User/shared/icons/icons';
import { SecCardComponent, SecLine } from './components/sec-card/sec-card.component';
import { SectionHeadSecComponent } from './components/section-head-sec/section-head-sec.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ProfileService } from 'src/app/Core/Services/profile.service';
import { HistEntry, mapSecurityEvent } from './security-history.util';
import { SessionRow, mapSession } from './active-sessions.util';

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

  private static readonly MAX_VISIBLE_SESSIONS = 3;

  sessions: SessionRow[] = [];

  get visibleSessions(): SessionRow[] {
    return this.sessions.slice(0, SecurityComponent.MAX_VISIBLE_SESSIONS);
  }

  get sessionsAction(): string {
    return this.sessions.length ? 'Ver todas' : '';
  }

  goSesiones(): void {
    this.router.navigate(['/seguridad/sesiones']);
  }

  private static readonly MAX_VISIBLE_HISTORY = 3;

  history: HistEntry[] = [];

  get visibleHistory(): HistEntry[] {
    return this.history.slice(0, SecurityComponent.MAX_VISIBLE_HISTORY);
  }

  get historyAction(): string {
    return this.history.length ? 'Ver todo' : '';
  }

  goHistorial(): void {
    this.router.navigate(['/seguridad/historial']);
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    // Refresca el perfil cacheado para que `hasPassword` refleje el dato real,
    // ya que sesiones guardadas antes de este campo no lo traen.
    this.profileService.getProfile().subscribe();
    this.loadSessions();
    this.loadHistory();
  }

  private loadHistory(): void {
    this.profileService.getSecurityHistory().subscribe({
      next: (res) => {
        if (res.blnError || !res.returnValue) return;
        this.history = res.returnValue.map(mapSecurityEvent);
      },
      error: () => {},
    });
  }

  private loadSessions(): void {
    this.profileService.getSessions().subscribe({
      next: (res) => {
        if (res.blnError || !res.returnValue) return;
        this.sessions = res.returnValue.map(mapSession);
      },
      error: () => {},
    });
  }

  goBack()      { this.router.navigate(['/config']); }
  changePass()  { if (this.hasPassword) this.router.navigate(['/seguridad/cambiar-contrasena']); }
  manage2FA()   { this.router.navigate(['/seguridad/2fa']); }
  changePin()   { this.router.navigate(['/seguridad/pin']); }

  closeSession(id: string): void {
    this.profileService.closeSession(id).subscribe({
      next: (res) => { if (!res.blnError) this.loadSessions(); },
      error: () => {},
    });
  }

  closeAll(): void {
    this.profileService.closeOtherSessions().subscribe({
      next: (res) => { if (!res.blnError) this.loadSessions(); },
      error: () => {},
    });
  }
}