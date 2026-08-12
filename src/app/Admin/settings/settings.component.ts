import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GroupCardComponent } from 'src/app/User/shared/Components/group-card/group-card.component';
import { GroupLabelComponent } from 'src/app/User/shared/Components/group-label/group-label.component';
import { SettingRowComponent } from 'src/app/User/shared/Components/setting-row/setting-row.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { ICON_PERSON_CIRCLE, ICON_LOCK, ICON_NOTIFICATIONS, ICON_VOLUME, ICON_LANGUAGE, ICON_DOC_OUTLINE, ICON_SHIELD_CHECK, ICON_CAMERA, ICON_POWER } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { NotificationService } from 'src/app/Core/Services/notification.service';
import { SoundService } from 'src/app/Core/Services/sound.service';
import { nameInitial, nameColor } from 'src/app/Core/Utils/avatar.utils';

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent, GoldButtonComponent,
    AdminNavComponent, AdminHeaderComponent,
    GroupLabelComponent, GroupCardComponent, SettingRowComponent, ToggleComponent,
  ],
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminSettingsComponent {
  iconPersonCircle = ICON_PERSON_CIRCLE;
  iconLock         = ICON_LOCK;
  iconNotifs       = ICON_NOTIFICATIONS;
  iconVolume       = ICON_VOLUME;
  iconLanguage     = ICON_LANGUAGE;
  iconDoc          = ICON_DOC_OUTLINE;
  iconShield       = ICON_SHIELD_CHECK;
  iconCamera       = ICON_CAMERA;
  iconPower        = ICON_POWER;

  logo = 'assets/logo.png';

  readonly sound = this.soundService.enabled;

  private readonly termsUrl   = 'https://bjimenez867.github.io/biozin-pages/terms.html';
  private readonly privacyUrl = 'https://bjimenez867.github.io/biozin-pages/privacy.html';



  get notifs(): boolean { return this.notificationService.notifsEnabled(); }
  constructor(
    private router: Router,
    private authService: AuthService,
    private soundService: SoundService,
    private notificationService: NotificationService,

  ) {}

  setSound(v: boolean) { this.soundService.setEnabled(v); }

  private get staffName(): string {
    const p = this.authService.currentProfile();
    return p?.displayName || p?.username || '';
  }

  get staffInitial(): string { return nameInitial(this.staffName); }
  get staffInitBg():  string { return nameColor(this.staffName); }

  goBack(){ this.router.navigate(['/admin']); }
  goPerfil()  { this.router.navigate(['/admin/miperfil']); }
  goSeguridad() { this.router.navigate(['/admin/seguridad']); }
  setNotifs(v: boolean) { this.notificationService.setNotifsEnabled(v); }

  goTerminos()  { Browser.open({ url: this.termsUrl }); }
  goPoliticas() { Browser.open({ url: this.privacyUrl }); }

  logout() { this.authService.logout(); this.router.navigate(['/welcome'], { replaceUrl: true }); }
}