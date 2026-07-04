import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { ICON_TROPHY } from 'src/app/User/shared/icons/icons';
import { PromotionService } from 'src/app/Core/Services/promotion.service';
import { PromotionClaim } from 'src/app/Core/Models/promotion.models';

@Component({
  standalone: true,
  imports: [CommonModule, AtmosphereComponent, SvgIconComponent, AdminHeaderComponent, AdminNavComponent],
  selector: 'app-user-bonus-history',
  templateUrl: './user-bonus-history.component.html',
  styleUrls: ['./user-bonus-history.component.scss'],
})
export class UserBonusHistoryComponent implements OnInit {
  iconTrophy = ICON_TROPHY;

  claims: PromotionClaim[] = [];
  loading = true;
  error = '';

  private userId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promotionService: PromotionService,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';

    this.promotionService.adminGetUserClaims(this.userId).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.claims = res.returnValue;
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

  goBack(): void {
    this.router.navigate(['/admin/usuario', this.userId]);
  }
}
