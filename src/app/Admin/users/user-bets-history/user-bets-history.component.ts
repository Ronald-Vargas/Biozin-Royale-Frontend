import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from '../../shared/admin-header/admin-header.component';
import { AdminNavComponent } from '../../shared/admin-nav/admin-nav.component';
import { ICON_DICE } from 'src/app/User/shared/icons/icons';
import { GamesHistoryService } from 'src/app/Core/Services/games-history.service';
import { HistorialJuegoResultado } from 'src/app/Core/Models/games-history.models';

const GAME_NAMES: Record<string, string> = {
  roulette:  'Roulette',
  blackjack: 'Blackjack',
  baccarat:  'Baccarat',
  slots:     'Slots',
  megawheel: 'Mega Wheel',
};

@Component({
  standalone: true,
  imports: [CommonModule, AtmosphereComponent, SvgIconComponent, AdminHeaderComponent, AdminNavComponent],
  selector: 'app-user-bets-history',
  templateUrl: './user-bets-history.component.html',
  styleUrls: ['./user-bets-history.component.scss'],
})
export class UserBetsHistoryComponent implements OnInit {
  iconDice = ICON_DICE;

  bets: HistorialJuegoResultado[] = [];
  loading = true;
  error = '';

  private userId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gamesHistoryService: GamesHistoryService,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';

    this.gamesHistoryService.adminGetHistory(this.userId).subscribe({
      next: (res) => {
        this.loading = false;
        if (!res.blnError && res.returnValue) {
          this.bets = res.returnValue;
        } else {
          this.error = res.strResponseMessage || 'No se pudo cargar el historial.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al conectar con el servidor.';
      },
    });
  }

  gameName(gameType: string): string {
    return GAME_NAMES[gameType] ?? gameType;
  }

  fmtProfit(n: number): string {
    return (n >= 0 ? '+$' : '-$') + Math.abs(n).toFixed(0);
  }

  goBack(): void {
    this.router.navigate(['/admin/usuario', this.userId]);
  }
}
