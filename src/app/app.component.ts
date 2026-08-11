import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { routeAnimations } from './route-animations';
import { PinGateService } from './Core/Services/pin-gate.service';
import { PinConfirmModalComponent } from './User/shared/Components/pin-confirm-modal/pin-confirm-modal.component';
import { NotificationToastComponent } from './Core/Components/notification-toast/notification-toast.component';
import { NotificationService } from './Core/Services/notification.service';
import { AuthService } from './Core/Services/auth.service';
import { SupabaseService } from './Core/Services/supabase.service';

/** Debe coincidir con el scheme registrado en AndroidManifest.xml e Info.plist. */
const OAUTH_NATIVE_REDIRECT = 'com.biozinroyale.app://auth/callback';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [CommonModule, IonApp, RouterOutlet, PinConfirmModalComponent, NotificationToastComponent],
  animations: [routeAnimations],
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);

  constructor(readonly pinGateService: PinGateService, readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    if (!Capacitor.isNativePlatform()) return;

    // El botón de Google abre el navegador (AuthService/login/register); cuando
    // termina, vuelve acá por este deep link en vez de navegar dentro del WebView.
    App.addListener('appUrlOpen', async ({ url }: URLOpenListenerEvent) => {
      if (!url.startsWith(OAUTH_NATIVE_REDIRECT)) return;
      await Browser.close().catch(() => {});

      const code = new URL(url).searchParams.get('code');
      if (!code) return;

      const { data, error } = await this.supabaseService.client.auth.exchangeCodeForSession(code);
      if (error || !data.session) return;

      this.authService.syncOAuth(data.session.access_token).subscribe((res) => {
        if (res.blnError || !res.returnValue) return;
        this.router.navigateByUrl(this.authService.getPostLoginRoute(res.returnValue), { replaceUrl: true });
      });
    });
  }

  // Valor que ordena las pantallas para la animación. Combinamos el
  // `depth` jerárquico con el índice de pestaña (`tab`) del bottom-nav:
  // así las pestañas que comparten depth (todas en 5) quedan ordenadas
  // de izquierda a derecha y se deslizan según su posición. Multiplicar
  // depth por 10 evita colisiones (tab va de 0 a 4).
  getOrder(outlet: RouterOutlet): number {
    if (!outlet?.isActivated) return 0;
    const data = outlet.activatedRouteData;
    return (data['depth'] ?? 0) * 10 + (data['tab'] ?? 0);
  }
}
