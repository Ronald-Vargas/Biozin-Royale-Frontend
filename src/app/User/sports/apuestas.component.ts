import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { AtmosphereComponent } from '../shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { ICON_ARROW_BACK, ICON_CLOSE } from '../shared/icons/icons';
import { BetOutcome, Sport, SportMatch } from '../../Core/Models/sports.models';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { BetsService } from 'src/app/Core/Services/bets.service';
import { SportsService } from 'src/app/Core/Services/sports.service';
import { BetSlipService } from 'src/app/Core/Services/bet-slip.service';


type Filter = 'all' | Sport;

@Component({
  standalone: true,
  imports: [IonContent, CommonModule, AtmosphereComponent, SvgIconComponent],
  selector: 'app-apuestas',
  templateUrl: './apuestas.component.html',
  styleUrls: ['./apuestas.component.scss'],
})
export class ApuestasComponent implements OnInit {
  iconBack  = ICON_ARROW_BACK;
  iconClose = ICON_CLOSE;

  activeFilter: Filter = 'all';
  activeLeague: 'all' | string = 'all';
  matches: SportMatch[] = [];
  loading   = false;
  loadError = '';

  // ── Bet panel state ───────────────────────────────────────
  showBetPanel  = false;
  displayAmount = '';
  rawAmount     = 0;
  showToast     = false;
  placing       = false;
  betError      = '';

  readonly balance = this.balanceService.balance;

  constructor(
    private router: Router,
    private balanceService: BalanceService,
    private sportsService: SportsService,
    private betsService: BetsService,
    private betSlipService: BetSlipService,
  ) {}

  ngOnInit(): void {
    this.balanceService.load();
    this.loadMatches();
  }

  private loadMatches(): void {
    this.loading   = true;
    this.loadError = '';
    this.sportsService.getMatches().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) {
          this.loadError = res.strResponseMessage ?? 'Error al cargar los partidos.';
          return;
        }
        this.matches = res.returnValue;
      },
      error: () => {
        this.loading   = false;
        this.loadError = 'Error de conexión. Intenta de nuevo.';
      },
    });
  }

  // ── Dynamic filter chips derived from loaded sports ───────
  get availableFilters(): { key: Filter; label: string }[] {
    const labels: Record<string, string> = {
      football:   '⚽ Fútbol',
      basketball: '🏀 NBA',
      tennis:     '🎾 Tenis',
    };
    const sports = [...new Set(this.matches.map(m => m.sport))];
    return [
      { key: 'all', label: 'Todo' },
      ...sports.map(s => ({ key: s as Filter, label: labels[s] ?? s })),
    ];
  }

  selectSport(key: Filter): void {
    this.activeFilter = key;
    this.activeLeague = 'all';
  }

  // ── Dynamic league chips, scoped to the active sport ──────
  get availableLeagues(): { key: string; label: string }[] {
    const pool = this.activeFilter === 'all'
      ? this.matches
      : this.matches.filter(m => m.sport === this.activeFilter);
    const leagues = [...new Set(pool.map(m => m.league))].sort();
    return [
      { key: 'all', label: 'Todas las ligas' },
      ...leagues.map(l => ({ key: l, label: l })),
    ];
  }

  selectLeague(key: string): void {
    this.activeLeague = key;
  }

  // ── Match filtering ───────────────────────────────────────
  get filtered(): SportMatch[] {
    return this.matches.filter(m =>
      (this.activeFilter === 'all' || m.sport === this.activeFilter) &&
      (this.activeLeague === 'all' || m.league === this.activeLeague)
    );
  }

  // ── Bet selection (compartida con el preview de Home) ─────
  get selectionCount(): number {
    return this.betSlipService.count;
  }

  isSelected(id: number, outcome: BetOutcome): boolean {
    return this.betSlipService.isSelected(id, outcome);
  }

  toggleBet(id: number, outcome: BetOutcome): void {
    this.betSlipService.toggle(id, outcome);
  }

  // ── Bet panel ─────────────────────────────────────────────
  get selectedList(): { match: SportMatch; outcome: BetOutcome }[] {
    return Object.entries(this.betSlipService.selections()).map(([idStr, outcome]) => ({
      match: this.matches.find(m => m.id === +idStr)!,
      outcome,
    }));
  }

  get totalOdds(): number {
    return this.selectedList.reduce(
      (acc, { match, outcome }) => acc * (match.odds[outcome] ?? 1),
      1,
    );
  }

  get potentialWin(): number {
    return this.rawAmount * this.totalOdds;
  }

  get isInsufficient(): boolean {
    return this.rawAmount > 0 && this.rawAmount > (this.balance() ?? 0);
  }

  get canConfirm(): boolean {
    return this.rawAmount > 0 && !this.isInsufficient && !this.placing;
  }

  outcomeLabel(match: SportMatch, outcome: BetOutcome): string {
    if (outcome === 'home') return `1 — Gana ${match.team1}`;
    if (outcome === 'draw') return 'X — Empate';
    return `2 — Gana ${match.team2}`;
  }

  selectionOdds(match: SportMatch, outcome: BetOutcome): number {
    return match.odds[outcome] ?? 1;
  }

  openBetPanel(): void {
    this.rawAmount     = 0;
    this.displayAmount = '';
    this.betError      = '';
    this.showBetPanel  = true;
  }

  closeBetPanel(): void {
    if (this.placing) return;
    this.showBetPanel = false;
  }

  onAmountInput(event: Event): void {
    const el  = event.target as HTMLInputElement;
    let raw   = el.value.replace(/[^\d.]/g, '');
    const dot = raw.indexOf('.');
    if (dot !== -1) raw = raw.slice(0, dot + 1) + raw.slice(dot + 1).replace(/\./g, '');
    const parts = raw.split('.');
    if (parts[1] !== undefined) parts[1] = parts[1].slice(0, 2);
    raw = parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];

    this.rawAmount     = parseFloat(raw) || 0;
    this.displayAmount = this.fmtInput(raw);
    el.value           = this.displayAmount;
  }

  fmtInput(raw: string): string {
    if (!raw) return '';
    const hasDot = raw.includes('.');
    const parts  = raw.split('.');
    parts[0]     = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return hasDot ? `${parts[0]}.${parts[1] ?? ''}` : parts[0];
  }

  setAmount(value: number): void {
    const capped       = Math.min(value, this.balance() ?? 0);
    this.rawAmount     = capped;
    this.displayAmount = this.fmtInput(capped.toFixed(2));
  }

  confirmBet(): void {
    if (!this.canConfirm) return;
    this.placing  = true;
    this.betError = '';

    const req = {
      amount:    this.rawAmount,
      totalOdds: this.totalOdds,
      selections: this.selectedList.map(({ match, outcome }) => ({
        matchId: match.id,
        team1:   match.team1,
        team2:   match.team2,
        league:  match.league,
        outcome,
        odds:    match.odds[outcome] ?? 1,
      })),
    };

    this.betsService.placeBet(req).subscribe({
      next: (res) => {
        this.placing = false;
        if (res.blnError || !res.returnValue) {
          this.betError = res.strResponseMessage ?? 'Error al realizar la apuesta.';
          return;
        }
        this.balanceService.set(res.returnValue.newBalance);
        this.betSlipService.clear();
        this.showBetPanel = false;
        this.showToast    = true;
        setTimeout(() => (this.showToast = false), 2500);
      },
      error: () => {
        this.placing  = false;
        this.betError = 'Error de conexión. Intenta de nuevo.';
      },
    });
  }

  goBack(): void { this.router.navigate(['/home']); }
}
