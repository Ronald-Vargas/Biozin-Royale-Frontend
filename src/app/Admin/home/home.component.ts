import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import {
  ICON_CHATBUBBLES, ICON_CHEVRON_FWD, ICON_POWER,
  ICON_PEOPLE, ICON_WALLET_FILLED, ICON_CASH, ICON_STATS,
} from 'src/app/User/shared/icons/icons';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AdminKpi } from 'src/app/Core/Models/admin.models';
import { KpiCardComponent } from './Components/kpi-card/kpi-card.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { ReportesService } from 'src/app/Core/Services/reportes.service';

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
export class HomeComponent implements OnInit {
  iconChevron     = ICON_CHEVRON_FWD;
  iconPower       = ICON_POWER;
  iconChatbubbles = ICON_CHATBUBBLES;

  logo        = 'assets/logo.png';
  loadingKpis = true;
  kpis: AdminKpi[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private reportesService: ReportesService,
  ) {}

  ngOnInit(): void {
    this.reportesService.getKpi().subscribe({
      next: (res) => {
        this.loadingKpis = false;
        if (!res.blnError && res.returnValue) {
          const d = res.returnValue;
          this.kpis = [
            { label: 'Usuarios activos', value: d.activeUsers.toLocaleString(),    delta: 'Total registrados', icon: ICON_PEOPLE        },
            { label: 'Depósitos',        value: `$${d.depositTotal.toFixed(2)}`,   delta: 'Hoy',              icon: ICON_WALLET_FILLED },
            { label: 'Retiros',          value: `$${d.withdrawalTotal.toFixed(2)}`,delta: 'Hoy',              icon: ICON_CASH          },
            { label: 'Ganancia neta',    value: `$${d.netProfit.toFixed(2)}`,      delta: 'Hoy',              icon: ICON_STATS         },
          ];
        }
      },
      error: () => { this.loadingKpis = false; },
    });
  }

  goPerfil()  { this.router.navigate(['/admin/miperfil']); }
  logout()    { this.authService.logout(); this.router.navigate(['/welcome'], { replaceUrl: true }); }
  goSoporte() { this.router.navigate(['/admin/soporte']); }
}
