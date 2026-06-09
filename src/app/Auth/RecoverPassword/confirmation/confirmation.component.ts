import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_CHECK, ICON_LOCK_FILLED } from 'src/app/User/shared/icons/icons';


interface Spark {
  x: number; y: number; size: number; delay: number; op: number;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, IonicModule, AtmosphereComponent,
    SvgIconComponent, GoldButtonComponent,
  ],
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  sparks: Spark[] = [];

  iconCheck = ICON_CHECK;
  iconLock  = ICON_LOCK_FILLED;

  constructor(private router: Router) {}

  ngOnInit() {
    for (let i = 0; i < 22; i++) {
      const ang  = (i / 22) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 70 + Math.random() * 70;
      this.sparks.push({
        x:     Math.cos(ang) * dist,
        y:     Math.sin(ang) * dist,
        size:  2 + Math.random() * 4,
        delay: 0.25 + Math.random() * 0.25,
        op:    0.6 + Math.random() * 0.4,
      });
    }
  }

  goLogin() { this.router.navigate(['/auth/login']); }
}