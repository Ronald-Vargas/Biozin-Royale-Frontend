import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_DOC, ICON_CHEVRON_FWD } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { RepKpi, REP_KPIS, RepGen, REP_GEN } from '../shared/admin.data';
import { RepKpiComponent } from './Components/rep-kpi/rep-kpi.component';

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent, RepKpiComponent,
  ],
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})


export class AdminReportsComponent {
  iconDoc     = ICON_DOC;
  iconChevron = ICON_CHEVRON_FWD;

  kpis: RepKpi[] = REP_KPIS;
  reports: RepGen[] = REP_GEN;

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/admin']); }
}