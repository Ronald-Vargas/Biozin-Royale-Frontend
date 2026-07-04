import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHEVRON_FWD, ICON_LOCK, ICON_RECEIPT, ICON_DICE, ICON_GIFT_FILLED, ICON_TROPHY } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { DetailMenuItem } from '../../shared/admin.data';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { UserAdminService } from 'src/app/Core/Services/user-admin.service';
import { AdminUser } from 'src/app/Core/Models/profile.models';

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

  user: AdminUser | null = null;
  loading = true;

  menu: DetailMenuItem[] = [
    { key: 'tx',           icon: ICON_RECEIPT,    title: 'Historial de transacciones', sub: 'Ver todas las transacciones' },
    { key: 'bets',         icon: ICON_DICE,       title: 'Historial de apuestas',      sub: 'Ver todas las apuestas' },
    { key: 'bonus',        icon: ICON_GIFT_FILLED, title: 'Crear bono',               sub: 'Otorgar un bono directamente al usuario' },
    { key: 'bonus-hist',   icon: ICON_TROPHY,     title: 'Historial de bonos',         sub: 'Ver bonos otorgados a este usuario' },
  ];

  private userId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userAdminService: UserAdminService,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';

    this.userAdminService.getAll().subscribe({
      next: (res) => {
        this.loading = false;
        this.user = res.returnValue?.find(u => u.id === this.userId) ?? null;
      },
      error: () => { this.loading = false; },
    });
  }

  onMenuClick(key: string): void {
    if (key === 'bonus')      this.router.navigate(['/admin/usuario', this.userId, 'bono']);
    if (key === 'bonus-hist') this.router.navigate(['/admin/usuario', this.userId, 'bonos']);
    if (key === 'bets')       this.router.navigate(['/admin/usuario', this.userId, 'apuestas']);
  }

  goBack(): void { this.router.navigate(['/admin/usuarios']); }
}
