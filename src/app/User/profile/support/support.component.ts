import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../../shared/Components/svg-icons/svg-icons.component';
import {
  ICON_HEADSET, ICON_CHEVRON_FWD, ICON_EDIT,
  ICON_WHATSAPP, ICON_MAIL, ICON_HELP_CIRC,
} from '../../shared/icons/icons';
import { GroupLabelComponent } from '../../shared/Components/group-label/group-label.component';

interface SupportItem {
  key:      string;
  icon:     string;
  label:    string;
  sub:      string;
  subColor: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent, GroupLabelComponent],
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})

export class SupportComponent{
  iconHeadset = ICON_HEADSET;
  iconChevron = ICON_CHEVRON_FWD;
  iconEdit    = ICON_EDIT;

  supportItems: SupportItem[] = [
    {
      key:      'wa',
      icon:     ICON_WHATSAPP,
      label:    'WhatsApp',
      sub:      '+52 55 1234 5678',
      subColor: '#4fd190',
    },
    {
      key:      'email',
      icon:     ICON_MAIL,
      label:    'Correo electrónico',
      sub:      'soporte@biozinroyale.com',
      subColor: '#cbb98f',
    },
    {
      key:      'faq',
      icon:     ICON_HELP_CIRC,
      label:    'Preguntas frecuentes',
      sub:      'Encuentra respuestas rápidas',
      subColor: '#cbb98f',
    },
  ];

  constructor(private router: Router) {}

  goBack()        { this.router.navigate(['/perfil']); }
  goCrearTicket() { this.router.navigate(['/create-ticket']); }

  onSupportItem(key: string): void {
    if (key === 'faq') { this.router.navigate(['/faq']); }
  }
}