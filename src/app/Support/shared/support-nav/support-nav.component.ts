import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_GRID_OUTLINE, ICON_GRID_FILLED, ICON_PERSON_OUTLINE, ICON_PEOPLE, ICON_STATS, ICON_SETTINGS, ICON_CHATBUBBLES, ICON_CHATBUBBLES_OUT } from 'src/app/User/shared/icons/icons';


interface SupportNavItem {
  key: string; label: string; route: string; icon: string; iconActive: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-support-nav',
  templateUrl: './support-nav.component.html',
  styleUrls: ['./support-nav.component.scss'],
})
export class SupportNavComponent {
  @Input() current = 'panel';

  navItems: SupportNavItem[] = [
    { key: 'panel',    label: 'Panel',    route: '/support',          icon: ICON_GRID_OUTLINE,      iconActive: ICON_GRID_FILLED },
    { key: 'tickets',  label: 'Tickets',  route: '/soporte/tickets',  icon: ICON_CHATBUBBLES_OUT,   iconActive: ICON_CHATBUBBLES },
    { key: 'usuarios', label: 'Usuarios', route: '/soporte/usuarios', icon: ICON_PERSON_OUTLINE,    iconActive: ICON_PEOPLE },
    { key: 'reportes', label: 'Reportes', route: '/soporte/reportes', icon: ICON_STATS,             iconActive: ICON_STATS },
    { key: 'ajustes',  label: 'Ajustes',  route: '/soporte/ajustes',  icon: ICON_SETTINGS,          iconActive: ICON_SETTINGS },
  ];

  constructor(private router: Router) {}

  go(item: SupportNavItem) { this.router.navigate([item.route]); }
  isActive(key: string): boolean { return this.current === key; }
}