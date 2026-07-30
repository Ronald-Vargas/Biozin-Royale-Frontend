import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { GroupCardComponent } from 'src/app/User/shared/Components/group-card/group-card.component';
import { GroupLabelComponent } from 'src/app/User/shared/Components/group-label/group-label.component';
import { SettingRowComponent } from 'src/app/User/shared/Components/setting-row/setting-row.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import {
  ICON_NOTIFICATIONS, ICON_VOLUME, ICON_POWER,
  ICON_LOCK, ICON_DOC_OUTLINE, ICON_SHIELD_CHECK, ICON_CAMERA,
} from 'src/app/User/shared/icons/icons';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { AuthService } from 'src/app/Core/Services/auth.service';


@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent,
    GoldButtonComponent, SupportNavComponent, AdminHeaderComponent, ToggleComponent,
    GroupLabelComponent, GroupCardComponent, SettingRowComponent,
  ],
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsComponent {
  iconNotifs = ICON_NOTIFICATIONS;
  iconVolume = ICON_VOLUME;
  iconPower  = ICON_POWER;
  iconLock   = ICON_LOCK;
  iconDoc    = ICON_DOC_OUTLINE;
  iconShield = ICON_SHIELD_CHECK;
  iconCamera = ICON_CAMERA;

  avail      = true;
  notif      = true;
  sound      = false;
  logo       = 'assets/logo.png';

  readonly perfil = this.authService.currentProfile;

  private readonly termsUrl   = 'https://bjimenez867.github.io/biozin-pages/terms.html';
  private readonly privacyUrl = 'https://bjimenez867.github.io/biozin-pages/privacy.html';

  constructor(private router: Router, private authService: AuthService) {}

  goBack()  { this.router.navigate(['/support']); }
  logout()  { this.authService.logout(); this.router.navigate(['/welcome'], { replaceUrl: true }); }

  goSeguridad() { this.router.navigate(['/soporte/seguridad']); }

  goTerminos()  { Browser.open({ url: this.termsUrl }); }
  goPoliticas() { Browser.open({ url: this.privacyUrl }); }

  noop() {}
}