import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ICON_SEARCH } from '../shared/icons/icons';
import { ScreenShellComponent } from '../shared/Components/screen-shell/screen-shell.component';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { BigGameCardComponent, GameItem } from './Components/big-game-card/big-game-card.component';

interface Filter { key: string; label: string; }

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ScreenShellComponent, SvgIconComponent, BigGameCardComponent],
  selector: 'app-juegos',
  templateUrl: './juegos.component.html',
  styleUrls: ['./juegos.component.scss'],
})
export class GamesComponent {
  iconSearch = ICON_SEARCH;

  filter = 'todos';
  query  = '';

  filters: Filter[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'slots', label: 'Slots' },
    { key: 'mesa',  label: 'Mesa' },
  ];

  allGames: GameItem[] = [
    { name: 'Sweet Bonanza',      cat: 'slots', icon: 'ice-cream',   g1: '#b1318f', g2: '#3a1142', ic: '#ffd9f3' },
    { name: 'Gates of Olympus',   cat: 'slots', icon: 'flash',       g1: '#2a59b5', g2: '#0e1d44', ic: '#ffe6a6' },
    { name: 'Wanted',             cat: 'slots', icon: 'skull',       g1: '#9c5a23', g2: '#341a0c', ic: '#ffd9a6' },
    { name: 'Sugar Rush',         cat: 'slots', icon: 'cube',        g1: '#1f8a7a', g2: '#0c2e2a', ic: '#bbf6ec' },
    { name: 'Roulette',           cat: 'mesa',  icon: 'aperture',    g1: '#6e1f24', g2: '#2a0c0e', ic: '#ffcaa6' },
    { name: 'Blackjack',          cat: 'mesa',  icon: 'albums',      g1: '#1d5a3a', g2: '#0b2417', ic: '#a6ffc8' },
    { name: 'Baccarat',           cat: 'mesa',  icon: 'diamond',     g1: '#7a1f3a', g2: '#2a0c16', ic: '#ffb3c8' },
    { name: 'Lightning Roulette', cat: 'live',  icon: 'flash',       g1: '#4a2a8e', g2: '#160d33', ic: '#d9c0ff' },
    { name: 'Mega Wheel',         cat: 'live',  icon: 'sync-circle', g1: '#1f6e8a', g2: '#0c2a34', ic: '#a6e9ff' },
    { name: 'Poker Live',         cat: 'live',  icon: 'layers',      g1: '#2a5a2a', g2: '#0e240e', ic: '#c8ffa6' },
  ];

  constructor(private router: Router) {}

  get list(): GameItem[] {
    return this.allGames.filter(g =>
      (this.filter === 'todos' || g.cat === this.filter) &&
      (this.query.trim() === '' || g.name.toLowerCase().includes(this.query.toLowerCase()))
    );
  }

  goBack() { this.router.navigate(['/home'], { replaceUrl: true }); }
}