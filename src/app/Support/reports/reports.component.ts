import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_FLASH, ICON_CHECK_DONE, ICON_REFRESH, ICON_HAPPY } from 'src/app/User/shared/icons/icons';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { CAT_ICON } from '../shared/support.data';


interface StatCard { label: string; value: string; icon: string; tint: string; }
interface CatBar   { cat: string; n: number; icon: string; }

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent,
    SupportNavComponent, AdminHeaderComponent,
  ],
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  iconFlash   = ICON_FLASH;
  iconCheck   = ICON_CHECK_DONE;
  iconHappy   = ICON_HAPPY;
  iconRefresh = ICON_REFRESH;

  constructor(private router: Router) {}

  // ── Stats (pendiente conectar API) ───────────────────────────
  total    = 0;
  resolved = 0;
  get rate(): number        { return this.total ? Math.round((this.resolved / this.total) * 100) : 0; }
  get circleOffset(): number { return 2 * Math.PI * 38 * (1 - this.rate / 100); }
  get circleCirc(): number   { return 2 * Math.PI * 38; }

  get stats(): StatCard[] {
    return [
      { label: 'Tiempo medio de respuesta', value: '—',                              icon: ICON_FLASH,      tint: '#e6b450' },
      { label: 'Tickets resueltos',          value: `${this.resolved}/${this.total}`, icon: ICON_CHECK_DONE, tint: '#62d89b' },
      { label: 'Satisfacción (CSAT)',         value: '—',                            icon: ICON_HAPPY,      tint: '#6aa6e0' },
      { label: 'Reabiertos',                 value: '—',                             icon: ICON_REFRESH,    tint: '#e06a6a' },
    ];
  }

  get catBars(): CatBar[] { return []; }

  get maxCat(): number {
    return Math.max(...this.catBars.map(c => c.n));
  }

  barPct(n: number): string { return (n / this.maxCat * 100) + '%'; }

  goBack() { this.router.navigate(['/soporte']); }
}
