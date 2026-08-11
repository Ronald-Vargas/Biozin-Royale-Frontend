import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { BJ_TABLES, BjTable }   from './tables.data';
import { ICON_ADD_CIRCLE, ICON_ADD } from '../../shared/icons/icons';
import { TableCardComponent } from './Components/table-card/table-card.component';
import { SvgIconComponent } from '../../shared/Components/svg-icons/svg-icons.component';
import { AuthService } from 'src/app/Core/Services/auth.service';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { BlackjackRealtimeService } from 'src/app/Core/Services/blackjack-realtime.service';

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, SvgIconComponent, TableCardComponent],
  selector: 'app-blackjack-lobby',
  templateUrl: './blackjack-lobby.component.html',
  styleUrls: ['./blackjack-lobby.component.scss'],
})
export class BlackjackLobbyComponent implements OnInit, OnDestroy {
  iconAddCircle = ICON_ADD_CIRCLE;
  iconAdd       = ICON_ADD;

  // Tick local de 1s para que los countdowns de las mesas bajen solos entre
  // broadcasts del servidor
  private readonly now = signal(Date.now());
  private nowTimer: ReturnType<typeof setInterval> | null = null;

  // Ocupación y countdown en vivo desde el servidor; los tags (POPULAR/VIP)
  // siguen siendo decoración local. Sin conexión se ven las mesas estáticas.
  readonly liveTables = computed<BjTable[]>(() => {
    const live = this.realtime.lobby();
    const now = this.now();
    return BJ_TABLES.map(t => {
      const room = live.find(r => r.id === t.id);
      const secs = room?.phaseEndsUtc
        ? Math.max(0, Math.ceil((new Date(room.phaseEndsUtc).getTime() - now) / 1000))
        : 0;
      return {
        ...t,
        players: room?.players ?? 0,
        max_players: room?.maxPlayers ?? t.max_players,
        secs,
        state: room?.state,
      };
    });
  });

  get tables(): BjTable[] { return this.liveTables(); }

  get balance(): number { return this.balanceService.balance() ?? 0; }

  constructor(
    private router: Router,
    private authService: AuthService,
    private balanceService: BalanceService,
    private realtime: BlackjackRealtimeService,
  ) {}

  ngOnInit() {
    if (!this.authService.currentProfile()?.isGuest) {
      this.balanceService.load();
    }
    this.realtime.joinLobby().catch(() => { /* sin tiempo real se ven las mesas estáticas */ });
    this.nowTimer = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy() {
    if (this.nowTimer) clearInterval(this.nowTimer);
    this.realtime.leaveLobby();
  }

  fmt(n: number): string {
    return '$' + Number(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  goBack()     { this.router.navigate(['/home']); }
  goDeposito() { this.router.navigate(['/deposito']); }

  joinTable(t: BjTable) {
    this.router.navigate(['/blackjack', t.id]);
  }
}
