import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { ICON_GIFT_FILLED, ICON_CHECK_CIRCLE } from 'src/app/User/shared/icons/icons';
import { PromotionService } from 'src/app/Core/Services/promotion.service';
import { httpErrorMsg } from 'src/app/Core/Utils/http-error';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminHeaderComponent, AdminNavComponent,
  ],
  selector: 'app-user-bonus',
  templateUrl: './user-bonus.component.html',
  styleUrls: ['./user-bonus.component.scss'],
})
export class UserBonusComponent implements OnInit {
  iconGift  = ICON_GIFT_FILLED;
  iconCheck = ICON_CHECK_CIRCLE;

  userId = '';
  title = '';
  description = '';
  amount = 0;

  saving = false;
  saved = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promotionService: PromotionService,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  get valid(): boolean {
    return this.title.trim().length >= 3 && this.amount > 0;
  }

  submit(): void {
    if (!this.valid || this.saving) return;
    this.saving = true;
    this.error = '';

    this.promotionService.adminGrant(this.userId, {
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      amount: this.amount,
      isActive: false,
    }).subscribe({
      next: (res) => {
        this.saving = false;
        if (!res.blnError) {
          this.saved = true;
          setTimeout(() => this.router.navigate(['/admin/usuario', this.userId]), 1500);
        } else {
          this.error = res.strResponseMessage || 'No se pudo otorgar el bono.';
        }
      },
      error: (err) => {
        this.saving = false;
        this.error = httpErrorMsg(err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/usuario', this.userId]);
  }
}
