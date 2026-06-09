import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupLabelComponent } from '../../shared/Components/group-label/group-label.component';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_HEADSET, ICON_CHEVRON_FWD, ICON_MAIL, ICON_WHATSAPP, ICON_HELP_CIRC } from '../../shared/icons/icons';

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
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
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