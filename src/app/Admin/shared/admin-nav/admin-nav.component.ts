import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import {
  ICON_HOME_OUTLINE, ICON_HOME_FILLED,
  ICON_PERSON_OUTLINE, ICON_PERSON_FILLED,
  ICON_WALLET_OUTLINE, ICON_WALLET_FILLED,
  ICON_GIFT_OUTLINE, ICON_GIFT_FILLED,
  ICON_DOC, ICON_SETTINGS,
} from 'src/app/User/shared/icons/icons';

interface NavItem { key: string; label: string; route: string; icon: string; iconActive: string; }

const NAV_ITEMS: NavItem[] = [
  { key: 'home',     label: 'Inicio',   route: '/admin',          icon: ICON_HOME_OUTLINE,   iconActive: ICON_HOME_FILLED },
  { key: 'usuarios', label: 'Usuarios', route: '/admin/usuarios', icon: ICON_PERSON_OUTLINE, iconActive: ICON_PERSON_FILLED },
  { key: 'bonos',    label: 'Bonos',    route: '/admin/bonuses',  icon: ICON_GIFT_OUTLINE,   iconActive: ICON_GIFT_FILLED },
  { key: 'finanzas', label: 'Finanzas', route: '/admin/finanzas', icon: ICON_WALLET_OUTLINE, iconActive: ICON_WALLET_FILLED },
  { key: 'reportes', label: 'Reportes', route: '/admin/reportes', icon: ICON_DOC,            iconActive: ICON_DOC },
  { key: 'ajustes',  label: 'Ajustes',  route: '/admin/ajustes',  icon: ICON_SETTINGS,       iconActive: ICON_SETTINGS },
];

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss'],
})
export class AdminNavComponent {
  @Input() current = 'home';

  navItems: NavItem[] = NAV_ITEMS;

  constructor(private router: Router) {}

  go(item: NavItem) {
    this.router.navigate([item.route]);
  }

  isActive(key: string): boolean { return this.current === key; }
}