import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AtmosphereComponent }  from '../shared/components/atmosphere/atmosphere.component';
import { LogoComponent }        from '../shared/components/logo/logo.component';
import { CardsHeroComponent }   from '../shared/components/cards-hero/cards-hero.component';
import { GoldButtonComponent }  from '../shared/components/gold-button/gold-button.component';
import { GhostButtonComponent } from '../shared/components/GhostButton/ghost-button.component';

@Component({
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    AtmosphereComponent,
    LogoComponent,
    CardsHeroComponent,
    GoldButtonComponent,
    GhostButtonComponent,
  ],
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage {
  slides = 4;
  active = 0;

  constructor(private router: Router) {}

  goLogin()  { this.router.navigate(['/auth/login']); }
  goGuest()  { this.router.navigate(['/guest']); }
}
