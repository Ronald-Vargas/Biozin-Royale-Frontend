import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { CardsHeroComponent } from 'src/app/User/shared/Components/cards-hero/cards-hero.component';
import { GhostButtonComponent } from 'src/app/User/shared/Components/ghost-button/ghost-button.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { LogoComponent } from 'src/app/User/shared/Components/logo/logo.component';

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
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  slides = 4;
  active = 0;

  constructor(private router: Router) {}

  goLogin()  { this.router.navigate(['/auth/login']); }
  goGuest()  { this.router.navigate(['/guest']); }
}
