import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ICON_PERSON_FILLED, ICON_ADD } from '../shared/icons/icons';
import { AtmosphereComponent } from '../shared/Components/atmosphere/atmosphere.component';
import { CardsHeroComponent } from '../shared/Components/cards-hero/cards-hero.component';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { BottomNavComponent } from './Components/bottom-nav/bottom-nav.component';
import { Game, GamesCardComponent } from './Components/games-card/games-card.component';
import { SectionHeadComponent } from './Components/section-head/section-head.component';
import { BetOutcome, SPORT_MATCHES, SportMatch } from '../sports/sports.data';
import { BalanceService } from '../shared/balance.service';

@Component({
  standalone: true,
  imports: [
    IonContent, CommonModule,
    AtmosphereComponent, CardsHeroComponent, SvgIconComponent,
    BottomNavComponent, SectionHeadComponent, GamesCardComponent,
  ],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  currentNav = 'home';

  iconPerson = ICON_PERSON_FILLED;
  iconAdd    = ICON_ADD;

  games: Game[] = [
    { name: 'Slots',      icon: 'slots',     g1: '#4a2a6e', g2: '#1c0f33', ic: '#e9c0ff' },
    { name: 'Roulette',   icon: 'roulette',  g1: '#6e1f24', g2: '#2a0c0e', ic: '#ffcaa6' },
    { name: 'Blackjack',  icon: 'blackjack', g1: '#1d5a3a', g2: '#0b2417', ic: '#a6ffc8' },
  ];

  featuredMatches: SportMatch[] = SPORT_MATCHES.slice(0, 2);
  bets: Record<number, BetOutcome> = {};

  isBetOn(id: number, outcome: BetOutcome): boolean {
    return this.bets[id] === outcome;
  }

  toggleBet(id: number, outcome: BetOutcome): void {
    if (this.bets[id] === outcome) {
      const next = { ...this.bets };
      delete next[id];
      this.bets = next;
    } else {
      this.bets = { ...this.bets, [id]: outcome };
    }
  }

  onGameClick(name: string) {
    if (name === 'Slots')    this.router.navigate(['/slots']);
    if (name === 'Roulette') this.router.navigate(['/ruleta']);
  }

  readonly balance = this.balanceService.balance;

  constructor(private router: Router, private balanceService: BalanceService) {}

  goMiPerfil()  { this.router.navigate(['/miperfil']); }
  goDeposito()  { this.router.navigate(['/deposito']); }
  goJuegos()    { this.router.navigate(['/juegos']); }
  goApuestas()  { this.router.navigate(['/apuestas']); }
}
