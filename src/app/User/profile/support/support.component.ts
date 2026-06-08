import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../shared/components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../shared/components/svg-icons/svg-icon.component';
import { GroupLabelComponent }  from '../shared/components/group-label/group-label.component';
import {
  ICON_HEADSET, ICON_MAIL, ICON_WHATSAPP, ICON_HELP_CIRC, ICON_CHEVRON_FWD,
} from '../shared/icons/icons';

interface SupportItem {
  key:      string;
  icon:     string;
  label:    string;
  sub:      string;
  subColor: string;
  iconColor: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, ScreenShellComponent, SvgIconComponent, GroupLabelComponent,
  ],
  selector: 'app-soporte',
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.scss'],
})
export class SoportePage {
  iconHeadset = ICON_HEADSET;
  iconChevron = ICON_CHEVRON_FWD;

  items: SupportItem[] = [
    {
      key: 'mail',
      icon: ICON_MAIL,
      label: 'Enviar correo',
      sub: 'soporte@biozinroyale.com',
      subColor: '#cbb98f',
      iconColor: 'var(--gold-1)',
    },
    {
      key: 'wa',
      icon: ICON_WHATSAPP,
      label: 'WhatsApp',
      sub: '+51 987 654 321',
      subColor: '#4fd190',
      iconColor: '#4fd190',
    },
    {
      key: 'faq',
      icon: ICON_HELP_CIRC,
      label: 'Preguntas frecuentes',
      sub: 'Encuentra respuestas rápidas',
      subColor: '#cbb98f',
      iconColor: 'var(--gold-1)',
    },
  ];

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/perfil']); }
  onPick(key: string) { /* placeholder */ }
}