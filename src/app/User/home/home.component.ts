import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AtmosphereComponent } from '../shared/components/atmosphere/atmosphere.component';
import { CardsHeroComponent }  from '../shared/components/cards-hero/cards-hero.component';
import { SvgIconComponent }    from '../shared/components/svg-icons/svg-icon.component';
import { BottomNavComponent }  from './components/bottom-nav/bottom-nav.component';
import { SectionHeadComponent } from './components/section-head/section-head.component';
import { GameCardComponent, Game } from './components/game-card/game-card.component';
import { ICON_PERSON_FILLED, ICON_ADD, ICON_FOOTBALL } from '../shared/icons/icons';

@Component({
  standalone: true,
  imports: [
    IonContent, CommonModule,
    AtmosphereComponent, CardsHeroComponent, SvgIconComponent,
    BottomNavComponent, SectionHeadComponent, GameCardComponent,
  ],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomePage {
  currentNav = 'home';

  iconPerson   = ICON_PERSON_FILLED;
  iconAdd      = ICON_ADD;
  iconFootball = ICON_FOOTBALL;

  games: Game[] = [
    { name: 'Slots',      icon: 'slots',     g1: '#4a2a6e', g2: '#1c0f33', ic: '#e9c0ff' },
    { name: 'Roulette',   icon: 'roulette',  g1: '#6e1f24', g2: '#2a0c0e', ic: '#ffcaa6' },
    { name: 'Blackjack',  icon: 'blackjack', g1: '#1d5a3a', g2: '#0b2417', ic: '#a6ffc8' },
  ];

  constructor(private router: Router) {}

  goMiPerfil() { this.router.navigate(['/miperfil']); }
  goDeposito() { this.router.navigate(['/deposito']); }
  goJuegos() { this.router.navigate(['/juegos']); }
}
