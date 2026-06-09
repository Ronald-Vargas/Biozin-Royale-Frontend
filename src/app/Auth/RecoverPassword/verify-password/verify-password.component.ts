import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from 'src/app/User/shared/Components/gold-button/gold-button.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { ICON_MAIL } from 'src/app/User/shared/icons/icons';
import { AuthHeaderComponent } from '../../Components/auth-header/auth-header.component';


@Component({
  standalone: true,
  imports: [
    CommonModule, IonicModule, AtmosphereComponent, SvgIconComponent,
    GoldButtonComponent, AuthHeaderComponent,
  ],
  selector: 'app-verify-password.component',
  templateUrl: './verify-password.component.html',
  styleUrls: ['./verify-password.component.scss'],
})
export class VerifyPasswordComponent implements OnInit, OnDestroy, AfterViewInit {
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
    this.router.navigate(['/auth/new-password']);
  }

  goBack()  { this.router.navigate(['/auth/forgot']); }
  goLogin() { this.router.navigate(['/auth/login']); }
}