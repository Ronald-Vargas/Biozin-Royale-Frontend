import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ICON_BACK, ICON_PERSON_FILLED } from '../shared/icons/icons';
import { AtmosphereComponent } from '../shared/Components/atmosphere/atmosphere.component';
import { GoldButtonComponent } from '../shared/Components/gold-button/gold-button.component';
import { LogoComponent } from '../shared/Components/logo/logo.component';
import { SvgIconComponent } from '../shared/Components/svg-icons/svg-icons.component';
import { SupabaseService } from 'src/app/Core/Services/supabase.service';
import { AuthService } from 'src/app/Core/Services/auth.service';

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
export class GuestComponent {
  iconBack   = ICON_BACK;
  iconPerson = ICON_PERSON_FILLED;
  loading = false;
  errorMsg = '';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private authService: AuthService,
  ) {}

  goBack()     { this.router.navigate(['/welcome'], { replaceUrl: true }); }
  goRegister() { this.router.navigate(['/auth/register']); }

  async continuarComoInvitado(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    this.errorMsg = '';

    const { data, error } = await this.supabaseService.client.auth.signInAnonymously();
    if (error || !data.session) {
      this.loading = false;
      this.errorMsg = 'No se pudo continuar como invitado. Intenta de nuevo.';
      return;
    }

    this.authService.syncOAuth(data.session.access_token).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.blnError || !res.returnValue) {
          this.errorMsg = res.strResponseMessage || 'No se pudo continuar como invitado.';
          return;
        }
        this.router.navigate([this.authService.getPostLoginRoute(res.returnValue)], { replaceUrl: true });
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudo conectar con el servidor.';
      },
    });
  }
}