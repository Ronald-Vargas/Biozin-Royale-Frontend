import { Component, OnInit } from '@angular/core';
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
import { BetOutcome, SportMatch } from '../../Core/Models/sports.models';
import { BalanceService } from 'src/app/Core/Services/balance.service';
import { SportsService } from 'src/app/Core/Services/sports.service';
import { BetSlipService } from 'src/app/Core/Services/bet-slip.service';


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
export class HomeComponent implements OnInit {
  currentNav = 'home';

  iconPerson = ICON_PERSON_FILLED;
  iconAdd    = ICON_ADD;

  games: Game[] = [
    { name: 'Slots',      icon: 'slots',     g1: '#4a2a6e', g2: '#1c0f33', ic: '#e9c0ff' },
    { name: 'Roulette',   icon: 'roulette',  g1: '#6e1f24', g2: '#2a0c0e', ic: '#ffcaa6' },
    { name: 'Blackjack',  icon: 'blackjack', g1: '#1d5a3a', g2: '#0b2417', ic: '#a6ffc8' },
  ];

  featuredMatches: SportMatch[] = [];

  readonly balance = this.balanceService.balance;

  constructor(
    private router: Router,
    private sportsService: SportsService,
    private balanceService: BalanceService,
    private betSlipService: BetSlipService,
  ) {}

  ngOnInit(): void {
    this.balanceService.load();
    this.sportsService.getMatches().subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue) {
          this.featuredMatches = res.returnValue.slice(0, 2);
        }
      },
    });
  }

  get betSelectionCount(): number {
    return this.betSlipService.count;
  }

  isBetOn(id: number, outcome: BetOutcome): boolean {
    return this.betSlipService.isSelected(id, outcome);
  }

  toggleBet(id: number, outcome: BetOutcome): void {
    this.betSlipService.toggle(id, outcome);
  }

  onGameClick(name: string) {
    if (name === 'Slots')    this.router.navigate(['/slots']);
    if (name === 'Roulette') this.router.navigate(['/ruleta']);
    if (name === 'Blackjack') this.router.navigate(['/blackjack-lobby']);
  }

  goMiPerfil()  { this.router.navigate(['/miperfil']); }
  goDeposito()  { this.router.navigate(['/deposito']); }
  goJuegos()    { this.router.navigate(['/juegos']); }
  goApuestas()  { this.router.navigate(['/apuestas']); }
}
