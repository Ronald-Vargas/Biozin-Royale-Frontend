import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { LogoComponent } from 'src/app/User/shared/Components/logo/logo.component';
import { SoundService } from 'src/app/Core/Services/sound.service';

@Component({
  standalone: true,
  imports: [IonContent, CommonModule, AtmosphereComponent, LogoComponent],
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})


export class SplashComponent implements OnInit, OnDestroy {
  pct = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private soundService: SoundService,
  ) {}

  ngOnInit(): void {
    // Fanfarria de entrada, estilo casino. Los navegadores bloquean audio sin
    // interacción previa del usuario; el splash suele llegar después de un tap
    // (ver el ícono de la app / botón "abrir"), así que normalmente sí suena,
    // pero si el sistema lo bloquea el catch() interno del servicio lo absorbe.
    this.soundService.play('splash');

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
