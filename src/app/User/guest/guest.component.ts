import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AtmosphereComponent } from '../shared/components/atmosphere/atmosphere.component';
import { LogoComponent }       from '../shared/components/logo/logo.component';
import { GoldButtonComponent } from '../shared/components/gold-button/gold-button.component';
import { SvgIconComponent }    from '../shared/components/svg-icons/svg-icon.component';
import { ICON_BACK, ICON_PERSON_FILLED } from '../shared/icons/icons';

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