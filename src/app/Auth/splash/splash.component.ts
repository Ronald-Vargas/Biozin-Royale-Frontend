import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';


@Component({
  standalone: true,
  imports: [IonContent, CommonModule, AtmosphereComponent, Component],
  selector: 'app-splash.component',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent implements OnInit, OnDestroy {
  pct = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    let p = 0;
    this.intervalId = setInterval(() => {
      p += Math.random() * 9 + 3;
      if (p >= 100) {
        p = 100;
        if (this.intervalId) clearInterval(this.intervalId);
        setTimeout(() => this.router.navigate(['/welcome'], { replaceUrl: true }), 600);
      }
      this.pct = Math.round(p);
      this.cdr.detectChanges();
    }, 140);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
