import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ScreenShellComponent } from '../../shared/components/screen-shell/screen-shell.component';
import { AtmosphereComponent }  from '../../shared/components/atmosphere/atmosphere.component';
import { SvgIconComponent }     from '../../shared/components/svg-icons/svg-icon.component';
import { GoldButtonComponent }  from '../../shared/components/gold-button/gold-button.component';
import { AuthHeaderComponent }  from '../components/auth-header/auth-header.component';
import { ICON_MAIL } from '../../shared/icons/icons';

@Component({
  standalone: true,
  imports: [
    CommonModule, IonicModule, AtmosphereComponent, SvgIconComponent,
    GoldButtonComponent, AuthHeaderComponent,
  ],
  selector: 'app-verificar',
  templateUrl: './verificar.component.html',
  styleUrls: ['./verificar.component.scss'],
})
export class VerificarPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = ['', '', '', '', '', ''];
  timer  = 45;
  shake  = false;

  iconMail = ICON_MAIL;

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startTimer();
  }

  ngAfterViewInit() {
    setTimeout(() => this.inputs.first?.nativeElement.focus(), 450);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startTimer() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.timer > 0) this.timer--;
      else if (this.intervalId) clearInterval(this.intervalId);
    }, 1000);
  }

  resend() {
    this.timer = 45;
    this.startTimer();
  }

  setAt(i: number, value: string) {
    const clean = value.replace(/[^0-9]/g, '');

    if (clean.length > 1) {
      // pasted code
      const arr = [...this.digits];
      clean.split('').slice(0, 6 - i).forEach((c, k) => arr[i + k] = c);
      this.digits = arr;
      const last = Math.min(i + clean.length, 5);
      setTimeout(() => this.inputs.get(last)?.nativeElement.focus(), 0);
    } else {
      this.digits[i] = clean;
      if (clean && i < 5) {
        setTimeout(() => this.inputs.get(i + 1)?.nativeElement.focus(), 0);
      }
    }
  }

  onKey(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !this.digits[i] && i > 0) {
      this.inputs.get(i - 1)?.nativeElement.focus();
    }
  }

  get code(): string    { return this.digits.join(''); }
  get complete(): boolean { return this.code.length === 6; }

  fmt(s: number): string {
    return '0' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  submit() {
    if (!this.complete) {
      this.shake = true;
      setTimeout(() => this.shake = false, 500);
      return;
    }
    this.router.navigate(['/auth/nueva']);
  }

  goBack()  { this.router.navigate(['/auth/forgot']); }
  goLogin() { this.router.navigate(['/auth/login']); }
}