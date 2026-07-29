import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_FLASH, ICON_CHECK_DONE, ICON_REFRESH, ICON_HAPPY } from 'src/app/User/shared/icons/icons';
import { SupportNavComponent } from '../shared/support-nav/support-nav.component';
import { CAT_ICON } from '../shared/support.data';
import { TicketService } from 'src/app/Core/Services/ticket.service';
import { TicketResultado } from 'src/app/Core/Models/ticket.models';

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
export class ReportsComponent implements OnInit {
  iconFlash   = ICON_FLASH;
  iconCheck   = ICON_CHECK_DONE;
  iconHappy   = ICON_HAPPY;
  iconRefresh = ICON_REFRESH;

  loading = true;
  private tickets: TicketResultado[] = [];

  constructor(private router: Router, private ticketService: TicketService) {}

  ngOnInit(): void {
    this.ticketService.listarTodos().subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.tickets = res.returnValue;
        }
      },
      error: () => { this.loading = false; },
    });
  }

  // ── Stats base ───────────────────────────────────────────────
  get total():    number { return this.tickets.length; }
  get resolved(): number { return this.tickets.filter(t => t.status === 'resuelto').length; }
  get pending():  number { return this.total - this.resolved; }

  get rate():          number { return this.total ? Math.round((this.resolved / this.total) * 100) : 0; }
  get circleCirc():    number { return 2 * Math.PI * 38; }
  get circleOffset():  number { return this.circleCirc * (1 - this.rate / 100); }

  get csat(): string {
    const rated = this.tickets.filter(t => t.rating != null);
    if (!rated.length) return '—';
    const avg = rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length;
    return avg.toFixed(1) + ' ★';
  }

  get csatPct(): string {
    const rated = this.tickets.filter(t => t.rating != null);
    if (!rated.length) return '';
    const pct = Math.round((rated.length / this.resolved) * 100);
    return `${rated.length} valorado${rated.length !== 1 ? 's' : ''} (${pct}%)`;
  }

  get stats(): StatCard[] {
    return [
      { label: 'Tickets resueltos',  value: `${this.resolved} / ${this.total}`, icon: ICON_CHECK_DONE, tint: '#62d89b' },
      { label: 'Pendientes',         value: String(this.pending),               icon: ICON_FLASH,      tint: '#e6b450' },
      { label: 'Satisfacción (CSAT)', value: this.csat,                         icon: ICON_HAPPY,      tint: '#6aa6e0' },
      { label: 'Tasa de resolución', value: this.total ? this.rate + '%' : '—', icon: ICON_REFRESH,    tint: '#d87070' },
    ];
  }

  // ── Tickets por categoría ─────────────────────────────────────
  get catBars(): CatBar[] {
    if (!this.tickets.length) return [];
    const map = new Map<string, number>();
    for (const t of this.tickets) {
      const cat = t.category || 'Otro';
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([cat, n]) => ({ cat, n, icon: CAT_ICON[cat] || CAT_ICON['Otro'] }))
      .sort((a, b) => b.n - a.n);
  }

  get maxCat(): number { return Math.max(...this.catBars.map(c => c.n), 1); }

  barPct(n: number): string { return (n / this.maxCat * 100) + '%'; }

  goBack() { this.router.navigate(['/soporte']); }
}
