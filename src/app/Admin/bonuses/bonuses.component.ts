import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { ICON_ADD_CIRCLE, ICON_CLOSE, ICON_GIFT_FILLED, ICON_SEARCH } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { PromotionService } from 'src/app/Core/Services/promotion.service';
import { Promotion } from 'src/app/Core/Models/promotion.models';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, ToggleComponent,
  ],
  selector: 'app-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.scss'],
})
export class BonusesComponent implements OnInit {
  iconAddCircle = ICON_ADD_CIRCLE;
  iconGift      = ICON_GIFT_FILLED;
  iconSearch    = ICON_SEARCH;
  iconClose     = ICON_CLOSE;

  bonos: Promotion[] = [];
  loading = true;
  error = '';
  showHidden = false;
  q = '';

  extendDaysOptions = [3, 5, 7];
  extendTarget: Promotion | null = null;
  extendError = '';

  constructor(private router: Router, private promotionService: PromotionService) {}

  ngOnInit(): void {
    this.promotionService.adminGetAll().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.bonos = res.returnValue;
        } else {
          this.error = res.strResponseMessage || 'No se pudieron cargar los bonos.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al conectar con el servidor.';
      },
    });
  }

  get activeCount(): number { return this.bonos.filter(b => b.isActive).length; }
  get totalCount():  number { return this.bonos.length; }

  get visibleBonos(): Promotion[] {
    let list = this.showHidden ? this.bonos : this.bonos.filter(b => b.isActive);

    const q = this.q.trim().toLowerCase();
    if (q) {
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        String(b.amount).includes(q)
      );
    }

    return list;
  }

  isExpired(b: Promotion): boolean {
    return !!b.endsAt && new Date(b.endsAt).getTime() <= Date.now();
  }

  toggle(b: Promotion): void {
    if (!b.isActive && this.isExpired(b)) {
      this.extendError = '';
      this.extendTarget = b;
      return;
    }
    this.applyToggle(b);
  }

  confirmExtend(days: number): void {
    if (!this.extendTarget) return;
    this.applyToggle(this.extendTarget, days);
  }

  cancelExtend(): void {
    this.extendTarget = null;
    this.extendError = '';
  }

  private applyToggle(b: Promotion, extendDays?: number): void {
    this.promotionService.adminToggle(b.id, extendDays).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          b.isActive = res.returnValue.isActive;
          b.endsAt = res.returnValue.endsAt;
          this.extendTarget = null;
          this.extendError = '';
        } else {
          this.extendError = res.strResponseMessage || 'No se pudo activar el bono.';
        }
      },
      error: (err) => {
        this.extendError = err?.error?.strResponseMessage || 'Error al conectar con el servidor.';
      },
    });
  }

  goBack()     { this.router.navigate(['/admin']); }
  goNew()      { this.router.navigate(['/admin/bonuses/new']); }
}
