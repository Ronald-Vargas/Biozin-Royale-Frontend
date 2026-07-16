import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GoldButtonComponent } from '../../shared/Components/gold-button/gold-button.component';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { ICON_TIME, ICON_CHECK_OUT, ICON_TROPHY } from '../../shared/icons/icons';
import { PromotionService } from 'src/app/Core/Services/promotion.service';
import { Promotion } from 'src/app/Core/Models/promotion.models';
import { BalanceService } from 'src/app/Core/Services/balance.service';

@Component({
  standalone: true,
  imports: [
    CommonModule, ScreenShellComponent, SvgIconComponent, GoldButtonComponent,
  ],
  selector: 'app-bonus-details',
  templateUrl: './bonus-details.component.html',
  styleUrls: ['./bonus-details.component.scss'],
})
export class BonusDetailsComponent implements OnInit {
  iconTime  = ICON_TIME;
  iconCheck = ICON_CHECK_OUT;
  iconTrophy = ICON_TROPHY;

  promotion: Promotion | null = null;
  loading = true;
  claiming = false;
  claimed = false;
  error = '';

  private promotionId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promotionService: PromotionService,
    private balanceService: BalanceService,
  ) {}

  ngOnInit(): void {
    this.promotionId = this.route.snapshot.paramMap.get('id') ?? '';

    this.promotionService.getActive().subscribe({
      next: (res) => {
        this.loading = false;
        const found = res.returnValue?.find(p => p.id === this.promotionId) ?? null;
        this.promotion = found;
        if (!found) this.error = 'Este bono no está disponible.';
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al cargar el bono.';
      },
    });
  }

  get expiresText(): string {
    if (!this.promotion?.endsAt) return 'Sin límite de tiempo';
    const diff = new Date(this.promotion.endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Expirado';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return `Expira en ${d > 0 ? d + 'd ' : ''}${h}h`;
  }

  get isExpired(): boolean {
    if (!this.promotion?.endsAt) return false;
    return new Date(this.promotion.endsAt).getTime() - Date.now() <= 0;
  }

  claim(): void {
    if (this.claiming || this.claimed || !this.promotionId || this.isExpired) return;
    this.claiming = true;
    this.error = '';

    this.promotionService.claim(this.promotionId).subscribe({
      next: (res) => {
        this.claiming = false;
        if (!res.blnError) {
          this.claimed = true;
          this.balanceService.load();
          setTimeout(() => this.router.navigate(['/bonos']), 1500);
        } else {
          this.error = res.strResponseMessage || 'No se pudo canjear el bono.';
        }
      },
      error: () => {
        this.claiming = false;
        this.error = 'Error al conectar con el servidor.';
      },
    });
  }

  goBack() { this.router.navigate(['/bonos']); }
}
