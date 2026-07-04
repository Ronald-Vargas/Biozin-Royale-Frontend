import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { ICON_GIFT_FILLED } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
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
  previewIcon = ICON_GIFT_FILLED;
  iconGift    = ICON_GIFT_FILLED;

  title  = '';
  description = '';
  amount = 0;
  days   = 7;
  enabled = true;
  saving = false;
  error = '';

  daysPresets = DAYS_PRESETS;

  constructor(private router: Router, private promotionService: PromotionService) {}

  get valid(): boolean { return this.title.trim().length >= 3 && this.amount > 0; }




  submit(): void {
    if (!this.valid || this.saving) return;
    this.saving = true;
    this.error = '';

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + this.days);

    this.promotionService.adminCreate({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
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
