import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SvgIconComponent } from '../../../shared/components/svg-icons/svg-icon.component';
import {
  ICON_HOME_FILLED, ICON_HOME_OUTLINE,
  ICON_GRID_FILLED, ICON_GRID_OUTLINE,
  ICON_WALLET_FILLED, ICON_WALLET_OUTLINE,
  ICON_GIFT_FILLED, ICON_GIFT_OUTLINE,
  ICON_PERSON_FILLED, ICON_PERSON_OUTLINE,
} from '../../../shared/icons/icons';

interface NavItem { key: string; label: string; route: string; filled: string; outline: string; }

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
})
export class BottomNavComponent {
  @Input() current = 'home';

  items: NavItem[] = [
    { key: 'home',   label: 'Inicio', route: '/home',   filled: ICON_HOME_FILLED,   outline: ICON_HOME_OUTLINE },
    { key: 'juegos', label: 'Juegos', route: '/juegos', filled: ICON_GRID_FILLED,   outline: ICON_GRID_OUTLINE },
    { key: 'wallet', label: 'Wallet', route: '/wallet', filled: ICON_WALLET_FILLED, outline: ICON_WALLET_OUTLINE },
    { key: 'bonos',  label: 'Bonos',  route: '/bonos',  filled: ICON_GIFT_FILLED,   outline: ICON_GIFT_OUTLINE },
    { key: 'perfil', label: 'Perfil', route: '/perfil', filled: ICON_PERSON_FILLED, outline: ICON_PERSON_OUTLINE },
  ];

  constructor(private router: Router) {}

  go(item: NavItem) {
    this.router.navigate([item.route], { replaceUrl: true });
  }
}
