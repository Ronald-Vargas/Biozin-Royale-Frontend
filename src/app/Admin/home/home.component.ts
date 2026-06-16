import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHEVRON_FWD, ICON_POWER } from 'src/app/User/shared/icons/icons';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AdminKpi, ADMIN_KPIS } from '../shared/admin.data';
import { KpiCardComponent } from './Components/kpi-card/kpi-card.component';

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, GoldButtonComponent,
    SvgIconComponent, AdminNavComponent, KpiCardComponent,
  ],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HomeComponent {
  iconChevron = ICON_CHEVRON_FWD;
  iconPower   = ICON_POWER;

  kpis: AdminKpi[] = ADMIN_KPIS;
  logo = 'assets/logo.png';

  constructor(private router: Router) {}

  goPerfil()  { this.router.navigate(['/miperfil']); }
  logout()    { this.router.navigate(['/welcome'], { replaceUrl: true }); }
}