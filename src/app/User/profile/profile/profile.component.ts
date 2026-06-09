import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GhostButtonComponent } from '../../shared/Components/ghost-button/ghost-button.component';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_PERSON_FILLED, ICON_CHEVRON_FWD, ICON_CARD, ICON_TIME, ICON_GIFT_OUTLINE, ICON_SETTINGS, ICON_HELP } from '../../shared/icons/icons';


interface MenuItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent, GhostButtonComponent],
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  iconPerson  = ICON_PERSON_FILLED;
  iconChevron = ICON_CHEVRON_FWD;

  menu: MenuItem[] = [
    { label: 'Métodos de pago', icon: ICON_CARD, route: '/pagos' },
    { label: 'Historial de juego', icon: ICON_TIME,         route: '/histjuegos' },
    { label: 'Mis bonos',          icon: ICON_GIFT_OUTLINE, route: '/bonos' },
    { label: 'Configuración',      icon: ICON_SETTINGS,     route: '/config' },
    { label: 'Soporte',            icon: ICON_HELP,         route: '/soporte' },
  ];

  constructor(private router: Router) {}

  goBack()     { this.router.navigate(['/home'], { replaceUrl: true }); }
  goProfile()  { this.router.navigate(['/miperfil']); }
  goTo(route: string) { this.router.navigate([route]); }
  logout()     { this.router.navigate(['/welcome'], { replaceUrl: true }); }
}
