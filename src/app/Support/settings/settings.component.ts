import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { ICON_NOTIFICATIONS, ICON_VOLUME, ICON_POWER } from 'src/app/User/shared/icons/icons';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { AuthService } from 'src/app/Core/Services/auth.service';


@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent,
    GoldButtonComponent, SupportNavComponent, AdminHeaderComponent, ToggleComponent,
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

  avail      = true;
  notif      = true;
  sound      = false;

  readonly perfil = this.authService.currentProfile;

  constructor(private router: Router, private authService: AuthService) {}

  goBack()  { this.router.navigate(['/support']); }
  logout()  { this.authService.logout(); this.router.navigate(['/welcome'], { replaceUrl: true }); }
}