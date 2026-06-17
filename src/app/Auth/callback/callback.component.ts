import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Subscription } from '@supabase/supabase-js';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SupabaseService } from 'src/app/Core/Services/supabase.service';

@Component({
  standalone: true,
  imports: [IonContent, IonSpinner, CommonModule, AtmosphereComponent],
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
})
export class CallbackComponent implements OnInit, OnDestroy {
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private authSub?: Subscription;
  private timeoutId?: ReturnType<typeof setTimeout>;
  private done = false;

  errorMsg = '';

  async ngOnInit(): Promise<void> {
    // 1. Si el proveedor (Google) regresó con un error en la URL, lo mostramos.
    const params = new URLSearchParams(
      window.location.hash.replace(/^#/, '') || window.location.search
    );
    const urlError = params.get('error_description') || params.get('error');
    if (urlError) {
      this.fail(urlError);
      return;
    }

    // 2. Nos suscribimos ANTES de consultar, para no perder el evento de login.
    const { data: listener } =
      this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
        if (session) {
          this.goHome();
        }
      });
    this.authSub = listener.subscription;

    // 3. Por si la sesión ya quedó lista al cargar (detectSessionInUrl).
    const { data, error } = await this.supabaseService.client.auth.getSession();
    if (error) {
      this.fail(error.message);
      return;
    }
    if (data.session) {
      this.goHome();
      return;
    }

    // 4. Si en 8s no hay sesión, no nos quedamos colgados.
    this.timeoutId = setTimeout(() => {
      this.fail('No se pudo establecer la sesión. Revisa la consola.');
    }, 8000);
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  private goHome(): void {
    if (this.done) return;
    this.done = true;
    if (this.timeoutId) clearTimeout(this.timeoutId);
    // Recarga completa a /home en vez de navegación interna: el IonRouterOutlet
    // se queda atascado al navegar desde el callback de OAuth. La sesión ya está
    // persistida en localStorage, así que /home carga ya autenticado.
    window.location.replace('/home');
  }

  private fail(message: string): void {
    if (this.done) return;
    this.done = true;
    if (this.timeoutId) clearTimeout(this.timeoutId);
    console.error('[callback] error:', message);
    this.errorMsg = message;
    this.cdr.detectChanges();
  }

  retry(): void {
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
