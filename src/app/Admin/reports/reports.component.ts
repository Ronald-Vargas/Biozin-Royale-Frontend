import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import {
  ICON_DOC, ICON_PEOPLE, ICON_WALLET_FILLED, ICON_CASH, ICON_STATS,
  ICON_DOWNLOAD,
} from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { RepKpi } from '../shared/admin.data';
import { RepKpiComponent } from './Components/rep-kpi/rep-kpi.component';
import { ReportesService, ReportPeriod } from 'src/app/Core/Services/reportes.service';

interface ReportCard {
  key:   ReportPeriod;
  title: string;
  sub:   string;
  loadingPdf:   boolean;
  loadingExcel: boolean;
}

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
export class AdminReportsComponent implements OnInit {
  iconDoc      = ICON_DOC;
  iconDownload = ICON_DOWNLOAD;

  loadingKpi = true;
  kpiError   = '';
  kpis: RepKpi[] = [];

  reports: ReportCard[] = [
    { key: 'd', title: 'Reporte diario',   sub: 'Transacciones del día actual',   loadingPdf: false, loadingExcel: false },
    { key: 'w', title: 'Reporte semanal',  sub: 'Transacciones de la semana',     loadingPdf: false, loadingExcel: false },
    { key: 'm', title: 'Reporte mensual',  sub: 'Transacciones del mes actual',   loadingPdf: false, loadingExcel: false },
    { key: 'y', title: 'Reporte anual',    sub: 'Transacciones del año en curso', loadingPdf: false, loadingExcel: false },
  ];

  constructor(private router: Router, private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.reportesService.getKpi().subscribe({
      next: (res) => {
        this.loadingKpi = false;
        if (!res.blnError && res.returnValue) {
          const d = res.returnValue;
          this.kpis = [
            { label: 'Usuarios activos', value: d.activeUsers.toLocaleString(),         sub: 'Registrados',  icon: ICON_PEOPLE        },
            { label: 'Depósitos',        value: `$${d.depositTotal.toFixed(2)}`,         sub: 'Hoy',          icon: ICON_WALLET_FILLED },
            { label: 'Retiros',          value: `$${d.withdrawalTotal.toFixed(2)}`,      sub: 'Hoy',          icon: ICON_CASH          },
            { label: 'Ganancia neta',    value: `$${d.netProfit.toFixed(2)}`,            sub: 'Hoy',          icon: ICON_STATS         },
          ];
        } else {
          this.kpiError = res.strResponseMessage || 'No se pudo cargar el resumen.';
        }
      },
      error: () => {
        this.loadingKpi = false;
        this.kpiError = 'Error al conectar con el servidor.';
      },
    });
  }

  downloadPdf(report: ReportCard): void {
    if (report.loadingPdf) return;
    report.loadingPdf = true;

    this.reportesService.downloadPdf(report.key).subscribe({
      next: (blob) => {
        report.loadingPdf = false;
        this.triggerDownload(blob, `reporte-${this.periodSuffix(report.key)}.pdf`);
      },
      error: () => { report.loadingPdf = false; },
    });
  }

  downloadExcel(report: ReportCard): void {
    if (report.loadingExcel) return;
    report.loadingExcel = true;

    this.reportesService.downloadExcel(report.key).subscribe({
      next: (blob) => {
        report.loadingExcel = false;
        this.triggerDownload(blob, `reporte-${this.periodSuffix(report.key)}.xlsx`);
      },
      error: () => { report.loadingExcel = false; },
    });
  }

  goBack(): void { this.router.navigate(['/admin']); }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private periodSuffix(period: ReportPeriod): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const ymd = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const ym  = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    switch (period) {
      case 'w': return `semanal-${ymd}`;
      case 'm': return `mensual-${ym}`;
      case 'y': return `anual-${now.getFullYear()}`;
      default:  return `diario-${ymd}`;
    }
  }
}
