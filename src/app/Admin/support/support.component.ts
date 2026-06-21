import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InitialsComponent } from 'src/app/Support/shared/initials/initials.component';
import { SUPPORT_TICKETS, TK_STATUS, TINTS } from 'src/app/Support/shared/support.data';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_TROPHY, ICON_FLASH, ICON_HAPPY, ICON_CHATBUBBLES, ICON_CHECK_DONE, ICON_TIME } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { AgentStat, AGENT_STATS } from '../shared/admin.data';
import { ASupKpiComponent, ASupKpi } from './Components/asup-kpi/asup-kpi.component';


interface StatusBar { st: string; n: number; color: string; }

@Component({
  standalone: true,
  imports: [
    CommonModule, AtmosphereComponent, SvgIconComponent,
    AdminNavComponent, AdminHeaderComponent,
    InitialsComponent, ASupKpiComponent,
  ],
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
  iconTrophy = ICON_TROPHY;
  iconFlash  = ICON_FLASH;
  iconHappy  = ICON_HAPPY;

  agents: AgentStat[] = AGENT_STATS;

  constructor(private router: Router) {}

  // ── Stats globales ──────────────────────────────────────────
  get total():    number { return SUPPORT_TICKETS.length; }
  get resolved(): number { return SUPPORT_TICKETS.filter(t => t.status === 'Resuelto').length; }
  get pending():  number { return this.total - this.resolved; }
  get rate():     number { return Math.round((this.resolved / this.total) * 100); }

  get kpis(): ASupKpi[] {
    return [
      { label: 'Tickets',    value: this.total,    icon: ICON_CHATBUBBLES, tint: '#6aa6e0', bg: 'rgba(90,150,220,0.16)' },
      { label: 'Resueltos',  value: this.resolved, icon: ICON_CHECK_DONE,  tint: '#62d89b', bg: 'rgba(63,174,110,0.16)',  sub: this.rate + '%' },
      { label: 'Pendientes', value: this.pending,  icon: ICON_TIME,        tint: '#e6b450', bg: 'rgba(212,167,60,0.16)' },
    ];
  }

  // ── Distribución por estado ─────────────────────────────────
  get statusBars(): StatusBar[] {
    return ['Nuevo', 'En proceso', 'Resuelto'].map(st => ({
      st,
      n:     SUPPORT_TICKETS.filter(t => t.status === st).length,
      color: TK_STATUS[st]?.color || '#c79a32',
    }));
  }

  get maxStatus(): number {
    return Math.max(...this.statusBars.map(s => s.n), 1);
  }

  barPct(n: number, max: number): string { return (n / max * 100) + '%'; }

  // ── Agentes ────────────────────────────────────────────────
  get maxResolved(): number {
    return Math.max(...this.agents.map(a => a.resolved));
  }

  get totalWeek(): number {
    return this.agents.reduce((a, b) => a + b.resolved, 0);
  }

  agentTint(i: number): string { return TINTS[(i + 1) % TINTS.length]; }
  isTop(i: number): boolean { return i === 0; }

  goBack() { this.router.navigate(['/admin']); }
}