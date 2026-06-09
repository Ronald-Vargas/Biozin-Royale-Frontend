import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ICON_BACK, ICON_PERSON_FILLED } from '../shared/icons/icons';
import { AtmosphereComponent } from '../shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from '../shared/Components/gold-button/gold-button.component';
import { LogoComponent } from '../shared/Components/logo/logo.component';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';

@Component({
  standalone: true,
  imports: [
    IonContent, CommonModule,
    AtmosphereComponent, LogoComponent, GoldButtonComponent, SvgIconComponent,
  ],
  selector: 'app-guest',
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.scss'],
})
export class GuestPage {
  iconBack   = ICON_BACK;
  iconPerson = ICON_PERSON_FILLED;

  constructor(private router: Router) {}

  goBack()     { this.router.navigate(['/welcome'], { replaceUrl: true }); }
  goHome()     { this.router.navigate(['/home'], { replaceUrl: true }); }
  goRegister() { this.router.navigate(['/auth/register']); }
}