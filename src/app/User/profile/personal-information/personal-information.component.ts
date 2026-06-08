import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../shared/components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../shared/components/svg-icons/svg-icon.component';
import {
  ICON_PERSON_OUTLINE, ICON_MAIL, ICON_AT, ICON_GLOBE,
  ICON_CALENDAR, ICON_PHONE_CALL, ICON_PERSON_CIRCLE,
  ICON_FINGERPRINT, ICON_COPY, ICON_CHECK, ICON_CAMERA,
  ICON_EDIT, ICON_STATS, ICON_ALBUMS, ICON_TROPHY,
  ICON_CASH, ICON_TRENDING,
} from '../shared/icons/icons';

interface InfoRow { k: string; v: string; icon: string; }
interface Stat    { icon: string; value: string; label: string; }

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent],
  selector: 'app-miperfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss'],
})
export class MiPerfilPage {
  copied = false;

  iconPersonCircle = ICON_PERSON_CIRCLE;
  iconFinger       = ICON_FINGERPRINT;
  iconCopy         = ICON_COPY;
  iconCheck        = ICON_CHECK;
  iconCalendar     = ICON_CALENDAR;
  iconCamera       = ICON_CAMERA;
  iconEdit         = ICON_EDIT;
  iconStats        = ICON_STATS;

  info: InfoRow[] = [
    { k: 'Nombre completo',     v: 'Juan Pérez',          icon: ICON_PERSON_OUTLINE },
    { k: 'Correo electrónico',  v: 'juanperez@gmail.com', icon: ICON_MAIL },
    { k: 'Usuario',             v: '@juanperez4',         icon: ICON_AT },
    { k: 'País',                v: 'Nicaragua',           icon: ICON_GLOBE },
    { k: 'Fecha de nacimiento', v: '15 Mayo 2000',        icon: ICON_CALENDAR },
    { k: 'Teléfono',            v: '+506 1234 5678',      icon: ICON_PHONE_CALL },
  ];

  stats: Stat[] = [
    { icon: ICON_ALBUMS,   value: '1,245',   label: 'Partidas\njugadas' },
    { icon: ICON_TROPHY,   value: '652',     label: 'Partidas\nganadas' },
    { icon: ICON_CASH,     value: '$42,500', label: 'Apostado\ntotal' },
    { icon: ICON_TRENDING, value: '$9,200',  label: 'Ganancias\nnetas' },
  ];

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/perfil']); }

  copyId() {
    try {
      if (navigator.clipboard) navigator.clipboard.writeText('84527193');
    } catch {}
    this.copied = true;
    setTimeout(() => this.copied = false, 1400);
  }

  editInfo() { /* placeholder */ }
}