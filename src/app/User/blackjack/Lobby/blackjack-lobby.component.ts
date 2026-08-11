import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, ScreenShellComponent, SvgIconComponent, TableCardComponent],
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

  // ── Mesas privadas ─────────────────────────────────────────

  showCreate = false;
  createMin = 10;
  createBots = true;
  joinCode = '';
  busy = false;
  msg: string | null = null;
  private msgTimer: ReturnType<typeof setTimeout> | null = null;

  readonly stakeOptions = [10, 25, 50, 100, 250];

  private flash(m: string) {
    if (this.msgTimer) clearTimeout(this.msgTimer);
    this.msg = m;
    this.msgTimer = setTimeout(() => this.msg = null, 2500);
  }

  private errMsg(err: unknown): string {
    const raw = err instanceof Error ? err.message : String(err);
    return /HubException: (.*)$/.exec(raw)?.[1] ?? 'No se pudo completar la acción.';
  }

  private esInvitado(): boolean {
    if (this.authService.currentProfile()?.isGuest) {
      this.router.navigate(['/auth/register'], { queryParams: { motivo: 'invitado' } });
      return true;
    }
    return false;
  }

  openCreate() {
    if (this.esInvitado()) return;
    this.showCreate = true;
  }

  closeCreate() { this.showCreate = false; }

  async createPrivate() {
    if (this.busy) return;
    this.busy = true;
    try {
      const roomId = await this.realtime.createPrivateRoom(
        this.createMin, this.createMin * 100, this.createBots);
      this.showCreate = false;
      this.router.navigate(['/blackjack', roomId]);
    } catch (err) {
      this.flash(this.errMsg(err));
    } finally {
      this.busy = false;
    }
  }

  async joinWithCode() {
    if (this.busy || this.joinCode.trim().length < 6) return;
    if (this.esInvitado()) return;
    this.busy = true;
    try {
      const roomId = await this.realtime.joinByCode(this.joinCode);
      this.router.navigate(['/blackjack', roomId]);
    } catch (err) {
      this.flash(this.errMsg(err));
    } finally {
      this.busy = false;
    }
  }
}
