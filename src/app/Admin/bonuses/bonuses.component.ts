import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ToggleComponent } from 'src/app/User/shared/Components/toggle/toggle.component';
import { ICON_ADD_CIRCLE } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { PromotionService } from 'src/app/Core/Services/promotion.service';
import { Promotion } from 'src/app/Core/Models/promotion.models';

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, ToggleComponent,
  ],
  selector: 'app-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.scss'],
})
export class BonusesComponent implements OnInit {
  iconAddCircle = ICON_ADD_CIRCLE;

  bonos: Promotion[] = [];
  loading = true;
  error = '';

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

  toggle(b: Promotion): void {
    this.promotionService.adminToggle(b.id).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          b.isActive = res.returnValue.isActive;
        }
      },
    });
  }

  goBack()     { this.router.navigate(['/admin']); }
  goNew()      { this.router.navigate(['/admin/bonuses/new']); }
}
