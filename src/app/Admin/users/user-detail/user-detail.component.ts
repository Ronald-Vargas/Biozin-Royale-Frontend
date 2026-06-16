import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHEVRON_FWD, ICON_LOCK, ICON_RECEIPT, ICON_DICE } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { AdminUser, DetailMenuItem, ADMIN_USERS } from '../../shared/admin.data';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';


@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent, AdminNavComponent,
    AdminHeaderComponent, UserAvatarComponent, StatusBadgeComponent,
  ],
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  iconChevron = ICON_CHEVRON_FWD;
  iconLock    = ICON_LOCK;

  user!: AdminUser;

  menu: DetailMenuItem[] = [
    { key: 'tx',   icon: ICON_RECEIPT, title: 'Historial de transacciones', sub: 'Ver todas las transacciones' },
    { key: 'bets', icon: ICON_DICE,    title: 'Historial de apuestas',      sub: 'Ver todas las apuestas' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.user = ADMIN_USERS.find(u => u.id === id) || ADMIN_USERS[0];
  }

  goBack() { this.router.navigate(['/admin/usuarios']); }
}