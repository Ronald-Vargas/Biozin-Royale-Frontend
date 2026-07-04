import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { ICON_CHECK_CIRCLE, ICON_GIFT_FILLED, ICON_CASH, ICON_SYNC_CIRCLE } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { BONO_KIND } from '../../shared/admin.data';
import { PromotionService } from 'src/app/Core/Services/promotion.service';

const DAYS_PRESETS = [3, 5, 7, 15, 30];

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, ToggleComponent,
  ],
  selector: 'app-new-bonuse',
  templateUrl: './new-bonuse.component.html',
  styleUrls: ['./new-bonuse.component.scss'],
})
export class NewBonuseComponent {
  iconCheck   = ICON_CHECK_CIRCLE;
  iconGift    = ICON_GIFT_FILLED;

  kind: 'Liquidez' | 'Tiradas' = 'Liquidez';
  title  = '';
  description = '';
  amount = 0;
  days   = 7;
  enabled = true;
  saving = false;
  error = '';

  daysPresets = DAYS_PRESETS;
  readonly kindOptions: Array<'Liquidez' | 'Tiradas'> = ['Liquidez', 'Tiradas'];

  constructor(private router: Router, private promotionService: PromotionService) {}

  get valid(): boolean { return this.title.trim().length >= 3 && this.amount > 0; }

  kindStyle(k: string) { return BONO_KIND[k] || BONO_KIND['Liquidez']; }
  isKind(k: string): boolean { return this.kind === k; }

  get previewIcon(): string {
    return this.kind === 'Liquidez' ? ICON_CASH : ICON_SYNC_CIRCLE;
  }

  submit(): void {
    if (!this.valid || this.saving) return;
    this.saving = true;
    this.error = '';

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + this.days);

    this.promotionService.adminCreate({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      promotionType: this.kind,
      amount: this.amount,
      isActive: this.enabled,
      endsAt: endsAt.toISOString(),
    }).subscribe({
      next: (res) => {
        this.saving = false;
        if (!res.blnError) {
          this.router.navigate(['/admin/bonuses']);
        } else {
          this.error = res.strResponseMessage || 'No se pudo crear el bono.';
        }
      },
      error: () => {
        this.saving = false;
        this.error = 'Error al conectar con el servidor.';
      },
    });
  }

  goBack() { this.router.navigate(['/admin/bonuses']); }
}
