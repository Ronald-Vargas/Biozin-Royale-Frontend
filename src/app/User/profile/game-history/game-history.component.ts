import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { GameThumbComponent, GameHist } from './Components/game-thumb/game-thumb.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { GamesHistoryService } from 'src/app/Core/Services/games-history.service';
import { HistorialJuegoResultado } from 'src/app/Core/Models/games-history.models';
import { ICON_DICE } from 'src/app/User/shared/icons/icons';

// El backend solo manda `gameType` (el slug de la tabla `bets`); el resto es
// presentación que no le compete a la API. Si llega un slug sin entrada acá,
// se usa GAME_DISPLAY_FALLBACK para no romper la fila.
const GAME_DISPLAY: Record<string, { name: string; cat: string; g1: string; g2: string; ic: string; icon: string }> = {
  roulette:   { name: 'Roulette',   cat: 'casino', g1: '#6e1f24', g2: '#2a0c0e', ic: '#ffcaa6', icon: 'aperture' },
  blackjack:  { name: 'Blackjack',  cat: 'casino', g1: '#1d5a3a', g2: '#0b2417', ic: '#a6ffc8', icon: 'albums' },
  baccarat:   { name: 'Baccarat',   cat: 'casino', g1: '#7a1f3a', g2: '#2a0c16', ic: '#ffb3c8', icon: 'diamond' },
  slots:      { name: 'Slots',      cat: 'slots',  g1: '#4a2a6e', g2: '#1c0f33', ic: '#e9c0ff', icon: 'cube' },
  megawheel:  { name: 'Mega Wheel', cat: 'live',   g1: '#1f6e8a', g2: '#0c2a34', ic: '#a6e9ff', icon: 'sync-circle' },
};

const GAME_DISPLAY_FALLBACK = { cat: 'casino', g1: '#3a3a3a', g2: '#161616', ic: '#cfcfcf', icon: 'cube' };

@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, GameThumbComponent, SvgIconComponent],
  selector: 'app-game-history',
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
  iconDice = ICON_DICE;
  gameHist: GameHist[] = [];
  loading = false;
  errorMsg = '';

  constructor(private router: Router, private gamesHistoryService: GamesHistoryService) {}

  ngOnInit(): void {
    this.loading = true;
    this.gamesHistoryService.getHistory().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) {
          this.errorMsg = res.strResponseMessage || 'No se pudo cargar el historial.';
          return;
        }
        this.gameHist = res.returnValue.map((g) => this.aGameHist(g));
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudo conectar con el servidor.';
      },
    });
  }

  private aGameHist(g: HistorialJuegoResultado): GameHist {
    const display = GAME_DISPLAY[g.gameType] ?? { ...GAME_DISPLAY_FALLBACK, name: g.gameType };
    const fecha = new Date(g.createdAt);

    return {
      ...display,
      date: fecha.toLocaleDateString('es-CR'),
      time: fecha.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
      bet:    g.amount,
      payout: g.payout,
      result: g.profit,
    };
  }

  fmtAmt(n: number): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  fmt(n: number): string {
    return (n >= 0 ? '+$' : '-$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  goBack() { this.router.navigate(['/perfil']); }
}