import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AtmosphereComponent } from '../../shared/components/atmosphere/atmosphere.component';
import { SvgIconComponent }    from '../../shared/components/svg-icons/svg-icon.component';
import { GoldButtonComponent } from '../../shared/components/gold-button/gold-button.component';
import { ICON_CHECK, ICON_LOCK_FILLED } from '../../shared/icons/icons';

interface Spark {
  x: number; y: number; size: number; delay: number; op: number;
}

@Component({
  standalone: true,
  imports: [
    CommonModule, IonicModule, AtmosphereComponent,
    SvgIconComponent, GoldButtonComponent,
  ],
  selector: 'app-actualizada',
  templateUrl: './actualizada.component.html',
  styleUrls: ['./actualizada.component.scss'],
})
export class ActualizadaPage implements OnInit {
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