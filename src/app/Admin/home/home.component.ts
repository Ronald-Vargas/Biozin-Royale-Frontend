import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHATBUBBLES, ICON_CHEVRON_FWD, ICON_POWER } from 'src/app/User/shared/icons/icons';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AdminKpi, ADMIN_KPIS } from '../shared/admin.data';
import { KpiCardComponent } from './Components/kpi-card/kpi-card.component';
import { AuthService } from 'src/app/Core/Services/auth.service';

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
  iconChatbubbles = ICON_CHATBUBBLES;

  kpis: AdminKpi[] = ADMIN_KPIS;
  logo = 'assets/logo.png';

  constructor(private router: Router, private authService: AuthService) {}

  goPerfil()  { this.router.navigate(['/admin/miperfil']); }
  logout()    { this.authService.logout(); this.router.navigate(['/welcome'], { replaceUrl: true }); }
  goSoporte() { this.router.navigate(['/admin/soporte']); }
}
