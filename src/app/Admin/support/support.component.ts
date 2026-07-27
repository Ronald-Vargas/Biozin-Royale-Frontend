import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InitialsComponent } from 'src/app/Support/shared/initials/initials.component';
import { TK_STATUS, TINTS } from 'src/app/Support/shared/support.data';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_TROPHY, ICON_HAPPY, ICON_CHATBUBBLES, ICON_CHECK_DONE, ICON_TIME } from 'src/app/User/shared/icons/icons';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';
import { ASupKpiComponent, ASupKpi } from './Components/asup-kpi/asup-kpi.component';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado } from 'src/app/Core/Models/ticket.models';

interface StatusBar { st: string; n: number; color: string; }
interface AgentRow  { name: string; resolved: number; }

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
export class SupportComponent implements OnInit {
  iconTrophy      = ICON_TROPHY;
  iconHappy       = ICON_HAPPY;
  iconChatbubbles = ICON_CHATBUBBLES;

  loading = true;
  agents: AgentRow[] = [];

  private tickets: TicketResultado[] = [];

  constructor(private router: Router, private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.listarTodos().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.tickets = res.returnValue;
          this.buildAgents();
        }
      },
      error: () => { this.loading = false; },
    });
  }

  private buildAgents(): void {
    const map = new Map<string, number>();
    for (const t of this.tickets) {
      if (t.assignedToName && t.status === 'resuelto') {
        map.set(t.assignedToName, (map.get(t.assignedToName) ?? 0) + 1);
      }
    }
    this.agents = [...map.entries()]
      .map(([name, resolved]) => ({ name, resolved }))
      .sort((a, b) => b.resolved - a.resolved);
  }

  // ── Stats globales ──────────────────────────────────────────
  get total():    number { return this.tickets.length; }
  get resolved(): number { return this.tickets.filter(t => t.status === 'resuelto').length; }
  get pending():  number { return this.total - this.resolved; }
  get rate():     number { return this.total ? Math.round((this.resolved / this.total) * 100) : 0; }

  get kpis(): ASupKpi[] {
    return [
      { label: 'Tickets',    value: this.total,    icon: ICON_CHATBUBBLES, tint: '#6aa6e0', bg: 'rgba(90,150,220,0.16)'                          },
      { label: 'Resueltos',  value: this.resolved, icon: ICON_CHECK_DONE,  tint: '#62d89b', bg: 'rgba(63,174,110,0.16)', sub: this.rate + '%'    },
      { label: 'Pendientes', value: this.pending,  icon: ICON_TIME,        tint: '#e6b450', bg: 'rgba(212,167,60,0.16)'                          },
    ];
  }

  // ── Distribución por estado ─────────────────────────────────
  private countStatus(key: string): number {
    return this.tickets.filter(t => t.status === key).length;
  }

  get statusBars(): StatusBar[] {
    return [
      { st: 'Nuevo',      n: this.countStatus('nuevo'),      color: TK_STATUS['Nuevo']?.color      || '#c79a32' },
      { st: 'En proceso', n: this.countStatus('en_proceso'), color: TK_STATUS['En proceso']?.color || '#c79a32' },
      { st: 'Resuelto',   n: this.countStatus('resuelto'),   color: TK_STATUS['Resuelto']?.color   || '#c79a32' },
    ];
  }

  get maxStatus():   number { return Math.max(...this.statusBars.map(s => s.n), 1); }
  get maxResolved(): number { return Math.max(...this.agents.map(a => a.resolved), 1); }
  get totalResolved(): number { return this.agents.reduce((a, b) => a + b.resolved, 0); }

  barPct(n: number, max: number): string { return (n / max * 100) + '%'; }

  agentTint(i: number): string { return TINTS[(i + 1) % TINTS.length]; }
  isTop(i: number):     boolean { return i === 0 && this.agents.length > 0; }

  goBack()    { this.router.navigate(['/admin']); }
  goTickets() { this.router.navigate(['/admin/tickets']); }
}
