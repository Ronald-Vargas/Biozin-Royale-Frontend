import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { ICON_LOCK, ICON_SHIELD_CHECK, ICON_PERSON_OUTLINE } from 'src/app/User/shared/icons/icons';
import { UserAdminService } from 'src/app/Core/Services/user-admin.service';
import { AdminUser, UserBlockInfo } from 'src/app/Core/Models/profile.models';

const REASON_LABELS: Record<string, string> = {
  fraude:         'Fraude',
  incumplimiento: 'Incumplimiento',
  conducta:       'Conducta inapropiada',
  sospechoso:     'Actividad sospechosa',
  otro:           'Otro',
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent, AdminHeaderComponent, AdminNavComponent],
  selector: 'app-user-block',
  templateUrl: './user-block.component.html',
  styleUrls: ['./user-block.component.scss'],
})
export class UserBlockComponent implements OnInit {
  iconLock        = ICON_LOCK;
  iconShieldCheck = ICON_SHIELD_CHECK;
  iconPerson      = ICON_PERSON_OUTLINE;

  user: AdminUser | null = null;
  blockInfo: UserBlockInfo | null = null;
  loading = true;
  submitting = false;
  error = '';

  reason = 'fraude';
  message = '';

  readonly reasons = Object.entries(REASON_LABELS).map(([k, l]) => ({ key: k, label: l }));

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
        this.user = res.returnValue?.find(u => u.id === this.userId) ?? null;

        if (this.user?.status === 'blocked') {
          this.userAdminService.getBlockInfo(this.userId).subscribe({
            next: (r) => {
              this.loading = false;
              this.blockInfo = r.returnValue ?? null;
            },
            error: () => { this.loading = false; },
          });
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; },
    });
  }

  get isBlocked(): boolean { return this.user?.status === 'blocked'; }
  get reasonLabel(): string { return REASON_LABELS[this.blockInfo?.reason ?? ''] ?? this.blockInfo?.reason ?? ''; }

  confirmBlock(): void {
    if (!this.message.trim() || this.submitting) return;
    this.submitting = true;
    this.error = '';

    this.userAdminService.blockUser(this.userId, { reason: this.reason, message: this.message.trim() }).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.blnError) { this.error = res.strResponseMessage; return; }
        this.router.navigate(['/admin/usuario', this.userId], { replaceUrl: true });
      },
      error: () => { this.submitting = false; this.error = 'Error al conectar con el servidor.'; },
    });
  }

  confirmUnblock(): void {
    if (this.submitting) return;
    this.submitting = true;
    this.error = '';

    this.userAdminService.unblockUser(this.userId).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.blnError) { this.error = res.strResponseMessage; return; }
        this.router.navigate(['/admin/usuario', this.userId], { replaceUrl: true });
      },
      error: () => { this.submitting = false; this.error = 'Error al conectar con el servidor.'; },
    });
  }

  goBack(): void { this.router.navigate(['/admin/usuario', this.userId]); }
}
