import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { GroupCardComponent } from '../../shared/Components/group-card/group-card.component';
import { GroupLabelComponent } from '../../shared/Components/group-label/group-label.component';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SettingRowComponent } from '../../shared/Components/setting-row/setting-row.component';
import { ToggleComponent } from '../../shared/Components/toggle/toggle.component';
import { ICON_PERSON_CIRCLE, ICON_LOCK, ICON_VOLUME, ICON_GLOBE, ICON_MOON, ICON_DOC, ICON_SHIELD } from '../../shared/icons/icons';
import { AuthService } from '../../../Core/Services/auth.service';
import { SoundService } from '../../../Core/Services/sound.service';


@Component({
  standalone: true,
  imports: [
    CommonModule, ScreenShellComponent,
    GroupLabelComponent, GroupCardComponent, SettingRowComponent, ToggleComponent,
  ],
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent {
  readonly sounds = this.soundService.enabled;

  private readonly termsUrl   = 'https://bjimenez867.github.io/biozin-pages/terms.html';
  private readonly privacyUrl = 'https://bjimenez867.github.io/biozin-pages/privacy.html';

  iconPerson   = ICON_PERSON_CIRCLE;
  iconLock     = ICON_LOCK;
  iconVolume   = ICON_VOLUME;
  iconLanguage = ICON_GLOBE;
  iconMoon     = ICON_MOON;
  iconDoc      = ICON_DOC;
  iconShield   = ICON_SHIELD;

  constructor(
    private router: Router,
    private authService: AuthService,
    private soundService: SoundService,
  ) {}

  setSounds(v: boolean) { this.soundService.setEnabled(v); }

  goBack()      { this.router.navigate(['/perfil']); }
  goMiPerfil()  { this.router.navigate(['/miperfil']); }

  goSeguridad() {
    if (this.authService.currentProfile()?.isGuest) {
      this.router.navigate(['/auth/register'], { queryParams: { motivo: 'invitado' } });
      return;
    }
    this.router.navigate(['/seguridad']);
  }

  goTerminos() { Browser.open({ url: this.termsUrl }); }
  goPoliticas() { Browser.open({ url: this.privacyUrl }); }
}