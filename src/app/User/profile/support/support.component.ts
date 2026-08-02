import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent }     from '../../shared/Components/svg-icons/svg-icons.component';
import {
  ICON_HEADSET, ICON_CHEVRON_FWD, ICON_EDIT,
  ICON_WHATSAPP, ICON_MAIL, ICON_HELP_CIRC, ICON_RECEIPT,
} from '../../shared/icons/icons';
import { GroupLabelComponent } from '../../shared/Components/group-label/group-label.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

interface SupportItem {
  key:      string;
  icon:     string;
  label:    string;
  sub:      string;
  subColor: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ScreenShellComponent, SvgIconComponent, GroupLabelComponent],
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
  iconHeadset  = ICON_HEADSET;
  iconChevron  = ICON_CHEVRON_FWD;
  iconEdit     = ICON_EDIT;
  iconReceipt  = ICON_RECEIPT;
  iconWhatsApp = ICON_WHATSAPP;
  iconMail     = ICON_MAIL;

  supportItems: SupportItem[] = [
    { key: 'wa',    icon: ICON_WHATSAPP,  label: 'WhatsApp',             sub: environment.support.waDisplay, subColor: '#4fd190' },
    { key: 'email', icon: ICON_MAIL,      label: 'Correo electrónico',   sub: environment.support.email,     subColor: '#cbb98f' },
    { key: 'faq',   icon: ICON_HELP_CIRC, label: 'Preguntas frecuentes', sub: 'Encuentra respuestas rápidas', subColor: '#cbb98f' },
  ];

  readonly categories = ['Pagos', 'Retiros', 'Cuenta', 'Bonos', 'Juegos', 'Otro'];

  sheet: 'wa' | 'email' | null = null;
  sheetCat  = '';
  sheetNote = '';

  constructor(private router: Router, private authService: AuthService) {}

  goBack()        { this.router.navigate(['/perfil']); }
  goCrearTicket() { this.router.navigate(['/create-ticket']); }
  goMisTickets()  { this.router.navigate(['/mis-tickets']); }

  onSupportItem(key: string): void {
    if (key === 'faq') { this.router.navigate(['/faq']); return; }
    if (key === 'wa' || key === 'email') {
      this.sheetCat  = '';
      this.sheetNote = '';
      this.sheet = key;
    }
  }

  closeSheet(): void { this.sheet = null; }

  openChannel(): void {
    const p       = this.authService.currentProfile();
    const name    = p?.displayName || p?.username || 'Usuario';
    const shortId = p?.id?.slice(0, 8) ?? '—';
    const cat     = this.sheetCat  || 'Sin categoría';
    const note    = this.sheetNote.trim() || 'Sin descripción adicional';

    const isNative = Capacitor.isNativePlatform();

    if (this.sheet === 'wa') {
      const text = `Hola, necesito ayuda:\n\nUsuario: ${name} (ID: ${shortId})\nCategoría: ${cat}\nMensaje: ${note}`;
      const url  = `https://wa.me/${environment.support.waNumber}?text=${encodeURIComponent(text)}`;
      isNative ? Browser.open({ url }) : window.open(url, '_blank');
    } else if (this.sheet === 'email') {
      const subject = `[Soporte] ${cat} - ${name}`;
      const body    = `Hola equipo de soporte,\n\nNecesito ayuda con lo siguiente:\n\nUsuario: ${name}\nID de cuenta: ${shortId}\nCategoría: ${cat}\nDescripción: ${note}\n\nQuedo en espera de su respuesta.\n\n${name}`;
      const url     = `mailto:${environment.support.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      isNative ? window.open(url, '_system') : (window.location.href = url);
    }

    this.closeSheet();
  }
}