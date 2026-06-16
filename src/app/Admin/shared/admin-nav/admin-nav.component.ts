import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ADMIN_NAV, AdminNavItem } from '../admin.data';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss'],
})
export class AdminNavComponent {
  @Input() current = 'home';

  navItems: AdminNavItem[] = ADMIN_NAV;

  constructor(private router: Router) {}

  go(item: AdminNavItem) {
    this.router.navigate([item.route]);
  }

  isActive(key: string): boolean { return this.current === key; }
}