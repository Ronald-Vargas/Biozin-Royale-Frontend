import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { ICON_LOCK_FILLED, ICON_EDIT, ICON_TRASH } from 'src/app/User/shared/icons/icons';
import { SecCardComponent, SecLine } from 'src/app/User/profile/config/security/components/sec-card/sec-card.component';
import { SectionHeadSecComponent } from 'src/app/User/profile/config/security/components/section-head-sec/section-head-sec.component';
import { SessionRow, mapSession } from 'src/app/User/profile/config/security/active-sessions.util';
import { HistEntry, mapSecurityEvent } from 'src/app/User/profile/config/security/security-history.util';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { StaffService } from 'src/app/Core/Services/staff.service';

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent, AdminHeaderComponent, SupportNavComponent,
    SecCardComponent, SectionHeadSecComponent,
  ],
  selector: 'app-support-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
})
export class SupportSecurityComponent implements OnInit {
  iconLock  = ICON_LOCK_FILLED;
  iconEdit  = ICON_EDIT;
  iconTrash = ICON_TRASH;

  constructor(
    private router: Router,
    private authService: AuthService,
    private staffService: StaffService,
  ) {}

  ngOnInit(): void {
    // Refresca el perfil cacheado: sesiones guardadas antes de que el backend
    // empezara a enviar `hasPassword` para staff no lo traen.
    this.staffService.getMe().subscribe();
    this.loadSessions();
    this.loadHistory();
  }

  get hasPassword(): boolean {
    return this.authService.currentProfile()?.hasPassword ?? true;
  }

  get passLines(): SecLine[] {
    if (!this.hasPassword) {
      return [{ label: 'Iniciaste sesión con Google, no tienes contraseña configurada.' }];
    }
    return [{ label: 'Mantén tu cuenta protegida con una contraseña segura.' }];
  }

  goBack()     { this.router.navigate(['/soporte/ajustes']); }
  changePass() { if (this.hasPassword) this.router.navigate(['/soporte/seguridad/cambiar-contrasena']); }

  private static readonly MAX_VISIBLE_SESSIONS = 3;

  sessions: SessionRow[] = [];

  get visibleSessions(): SessionRow[] {
    return this.sessions.slice(0, SupportSecurityComponent.MAX_VISIBLE_SESSIONS);
  }

  get sessionsAction(): string {
    return this.sessions.length ? 'Ver todas' : '';
  }

  goSesiones(): void {
    this.router.navigate(['/soporte/seguridad/sesiones']);
  }

  private loadSessions(): void {
    this.staffService.getSessions().subscribe({
      next: (res) => {
        if (res.blnError || !res.returnValue) return;
        this.sessions = res.returnValue.map(mapSession);
      },
      error: () => {},
    });
  }

  closeSession(id: string): void {
    this.staffService.closeSession(id).subscribe({
      next: (res) => { if (!res.blnError) this.loadSessions(); },
      error: () => {},
    });
  }

  closeAll(): void {
    this.staffService.closeOtherSessions().subscribe({
      next: (res) => { if (!res.blnError) this.loadSessions(); },
      error: () => {},
    });
  }

  private static readonly MAX_VISIBLE_HISTORY = 3;

  history: HistEntry[] = [];

  get visibleHistory(): HistEntry[] {
    return this.history.slice(0, SupportSecurityComponent.MAX_VISIBLE_HISTORY);
  }

  get historyAction(): string {
    return this.history.length ? 'Ver todo' : '';
  }

  goHistorial(): void {
    this.router.navigate(['/soporte/seguridad/historial']);
  }

  private loadHistory(): void {
    this.staffService.getSecurityHistory().subscribe({
      next: (res) => {
        if (res.blnError || !res.returnValue) return;
        this.history = res.returnValue.map(mapSecurityEvent);
      },
      error: () => {},
    });
  }
}
