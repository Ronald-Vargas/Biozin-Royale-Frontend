import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScreenShellComponent } from '../../shared/Components/screen-shell/screen-shell.component';
import { GameThumbComponent, GameHist } from './Components/game-thumb/game-thumb.component';


@Component({
  standalone: true,
  imports: [CommonModule, ScreenShellComponent, GameThumbComponent],
  selector: 'app-game-history',
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent {
  gameHist: GameHist[] = [
    { name: 'Bozin Roulette',   cat: 'casino',   date: '01/05/2024', time: '14:35', bet: 25, result: 60,  g1: '#6e1f24', g2: '#2a0c0e', ic: '#ffcaa6', icon: 'aperture' },
    { name: 'Royale Blackjack', cat: 'casino',   date: '01/05/2024', time: '14:20', bet: 50, result: -50, g1: '#1d5a3a', g2: '#0b2417', ic: '#a6ffc8', icon: 'albums' },
    { name: 'Lucky 7',          cat: 'slots',    date: '01/05/2024', time: '14:05', bet: 10, result: 15,  g1: '#9c5a23', g2: '#341a0c', ic: '#ffd9a6', icon: 'cube' },
    { name: 'Roulette Live',    cat: 'casino',   date: '01/05/2024', time: '13:50', bet: 40, result: -40, g1: '#4a2a8e', g2: '#160d33', ic: '#d9c0ff', icon: 'flash' },
    { name: 'Starburst',        cat: 'slots',    date: '01/05/2024', time: '13:30', bet: 20, result: 35,  g1: '#2a59b5', g2: '#0e1d44', ic: '#ffe6a6', icon: 'star' },
    { name: 'Mega Wheel',       cat: 'apuestas', date: '01/05/2024', time: '13:00', bet: 30, result: 45,  g1: '#1f6e8a', g2: '#0c2a34', ic: '#a6e9ff', icon: 'sync-circle' },
  ];

  constructor(private router: Router) {}

  fmt(n: number): string {
    return (n >= 0 ? '+$' : '-$') + Math.abs(n).toFixed(0);
  }

  goBack() { this.router.navigate(['/perfil']); }
}