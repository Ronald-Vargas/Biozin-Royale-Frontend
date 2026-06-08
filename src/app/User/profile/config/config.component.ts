import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../shared/components/screen-shell/screen-shell.component';
import { GroupLabelComponent }  from '../shared/components/group-label/group-label.component';
import { GroupCardComponent }   from '../shared/components/group-card/group-card.component';
import { SettingRowComponent }  from '../shared/components/setting-row/setting-row.component';
import { ToggleComponent }      from '../shared/components/toggle/toggle.component';
import {
  ICON_PERSON_CIRCLE, ICON_LOCK, ICON_VOLUME, ICON_GLOBE, ICON_MOON,
  ICON_DOC, ICON_SHIELD,
} from '../shared/icons/icons';

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
export class ConfigPage {
  sounds = true;

  iconPerson   = ICON_PERSON_CIRCLE;
  iconLock     = ICON_LOCK;
  iconVolume   = ICON_VOLUME;
  iconLanguage = ICON_GLOBE;
  iconMoon     = ICON_MOON;
  iconDoc      = ICON_DOC;
  iconShield   = ICON_SHIELD;

  constructor(private router: Router) {}

  goBack()      { this.router.navigate(['/perfil']); }
  goMiPerfil()  { this.router.navigate(['/miperfil']); }
  goSeguridad() { this.router.navigate(['/seguridad']); }
  noop()        { /* placeholder */ }
}