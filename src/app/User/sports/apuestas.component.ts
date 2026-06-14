import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { AtmosphereComponent } from '../shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { ICON_ARROW_BACK, ICON_CLOSE } from '../shared/icons/icons';
import { BetOutcome, Sport, SportMatch, SPORT_MATCHES } from './sports.data';
import { BalanceService } from '../shared/balance.service';

type Filter = 'all' | Sport;

@Component({
  standalone: true,
  imports: [IonContent, CommonModule, AtmosphereComponent, SvgIconComponent],
  selector: 'app-apuestas',
  templateUrl: './apuestas.component.html',
  styleUrls: ['./apuestas.component.scss'],
})
export class ApuestasComponent {
  iconBack  = ICON_ARROW_BACK;
  iconClose = ICON_CLOSE;

  activeFilter: Filter = 'all';
  selections: Record<number, BetOutcome> = {};
  matches: SportMatch[] = SPORT_MATCHES;

  filters: { key: Filter; label: string }[] = [
    { key: 'all',        label: 'Todo' },
    { key: 'football',   label: '⚽ Fútbol' },
    { key: 'basketball', label: '🏀 NBA' },
    { key: 'tennis',     label: '🎾 Tenis' },
  ];

  // ── Bet panel state ───────────────────────────────────────
  showBetPanel  = false;
  displayAmount = '';
  rawAmount     = 0;
  showToast     = false;

  readonly balance = this.balanceService.balance;

  constructor(
    private router: Router,
    private balanceService: BalanceService,
  ) {}

  // ── Match filtering ───────────────────────────────────────
  get filtered(): SportMatch[] {
    return this.activeFilter === 'all'
      ? this.matches
      : this.matches.filter(m => m.sport === this.activeFilter);
  }

  // ── Bet selection ─────────────────────────────────────────
  get selectionCount(): number {
    return Object.keys(this.selections).length;
  }

  isSelected(id: number, outcome: BetOutcome): boolean {
    return this.selections[id] === outcome;
  }

  toggleBet(id: number, outcome: BetOutcome): void {
    if (this.selections[id] === outcome) {
      const next = { ...this.selections };
      delete next[id];
      this.selections = next;
    } else {
      this.selections = { ...this.selections, [id]: outcome };
    }
  }

  // ── Bet panel ─────────────────────────────────────────────
  get selectedList(): { match: SportMatch; outcome: BetOutcome }[] {
    return Object.entries(this.selections).map(([idStr, outcome]) => ({
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
    return this.rawAmount > 0 && this.rawAmount > this.balance();
  }

  get canConfirm(): boolean {
    return this.rawAmount > 0 && !this.isInsufficient;
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
    this.showBetPanel  = true;
  }

  closeBetPanel(): void {
    this.showBetPanel = false;
  }

  onAmountInput(event: Event): void {
    const el  = event.target as HTMLInputElement;
    // Strip everything except digits and one decimal point
    let raw   = el.value.replace(/[^\d.]/g, '');
    const dot = raw.indexOf('.');
    if (dot !== -1) raw = raw.slice(0, dot + 1) + raw.slice(dot + 1).replace(/\./g, '');
    // Limit to 2 decimal places
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
    const capped       = Math.min(value, this.balance());
    this.rawAmount     = capped;
    this.displayAmount = this.fmtInput(capped.toFixed(2));
  }

  confirmBet(): void {
    if (!this.canConfirm) return;
    this.balanceService.deduct(this.rawAmount);
    this.selections   = {};
    this.showBetPanel = false;
    this.showToast    = true;
    setTimeout(() => (this.showToast = false), 2500);
  }

  goBack(): void { this.router.navigate(['/home']); }
}
