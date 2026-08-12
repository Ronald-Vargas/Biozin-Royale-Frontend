import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Session, Subscription } from '@supabase/supabase-js';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SupabaseService } from 'src/app/Core/Services/supabase.service';
import { AuthService } from 'src/app/Core/Services/auth.service';

@Component({
  standalone: true,
  imports: [IonContent, IonSpinner, CommonModule, AtmosphereComponent],
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
})
export class CallbackComponent implements OnInit, OnDestroy {
  private readonly supabaseService = inject(SupabaseService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private authSub?: Subscription;
  private timeoutId?: ReturnType<typeof setTimeout>;
  private done = false;

  errorMsg = '';

  async ngOnInit(): Promise<void> {
    const params = new URLSearchParams(
      window.location.hash.replace(/^#/, '') || window.location.search
    );
    const urlError = params.get('error_description') || params.get('error');
    if (urlError) {
      this.fail(urlError);
      return;
    }

    const { data: listener } =
      this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
        if (session) {
          this.handleSession(session);
        }
      });
    this.authSub = listener.subscription;

    const { data, error } = await this.supabaseService.client.auth.getSession();
    if (error) {
      this.fail(error.message);
      return;
    }
    if (data.session) {
      this.handleSession(data.session);
      return;
    }

    this.timeoutId = setTimeout(() => {
      this.fail('No se pudo establecer la sesión. Revisa la consola.');
    }, 8000);
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  private handleSession(session: Session): void {
    if (this.done) return;
    this.done = true;
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.authService.syncOAuth(session.access_token).subscribe({
      next: (res) => {
        if (res.blnError || !res.returnValue) {
          this.showError(res.strResponseMessage || 'No se pudo sincronizar el perfil.');
          return;
        }
        this.redirect(this.authService.getPostLoginRoute(res.returnValue));
      },
      error: (err) => {
        const body = err?.error;
        if (this.timeoutId) clearTimeout(this.timeoutId);

        if (body?.strResponseTittle === 'Cuenta bloqueada') {
          // Redirigir al login con el mensaje como query param; el login ya
          // tiene el banner de bloqueo y no hay problemas de zona de Angular.
          const msg = encodeURIComponent(body.strResponseMessage ?? 'Tu cuenta ha sido bloqueada.');
          this.supabaseService.client.auth.signOut();
          window.location.replace(`/auth/login?blocked=${msg}`);
          return;
        }

        if (body?.strResponseTittle === '2FA requerido') {
          // Mismo destino que login.component.ts para login manual con 2FA.
          const email = encodeURIComponent(session.user.email ?? '');
          this.supabaseService.client.auth.signOut();
          window.location.replace(`/auth/verificar-2fa?email=${email}`);
          return;
        }

        this.showError('No se pudo sincronizar tu cuenta. Intenta iniciar sesión de nuevo.');
      },
    });
  }

  private redirect(path: string): void {
    window.location.replace(path);
  }

  // Muestra error en la propia pantalla del callback (errores de red/sesión).
  // No llamar desde dentro de handleSession porque done===true y el guard
  // dentro de fail() lo silenciaría; usar showError() en su lugar.
  private fail(message: string): void {
    if (this.done) return;
    this.done = true;
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.errorMsg = message;
    this.cdr.detectChanges();
  }

  private showError(message: string): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.errorMsg = message;
    this.cdr.detectChanges();
  }

  retry(): void {
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
