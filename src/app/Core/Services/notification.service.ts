import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, ObservableInput, catchError, filter, fromEvent, interval, merge, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { TicketService } from './ticket.service';

const POLL_MS = 8000;
const TOAST_MS = 3200;

/**
 * Notificaciones dentro de la app (sin push): sondea tickets/mensajes nuevos
 * y los muestra como toasts momentáneos. Corre mientras haya un perfil
 * activo (cualquier rol) — admin/soporte reciben tickets y mensajes nuevos
 * de todos los usuarios; un usuario normal solo recibe respuestas nuevas de
 * soporte en sus propios tickets (el backend decide el alcance según el rol
 * del token, ver `TicketsController.ObtenerNotificaciones`).
 *
 * El sondeo entero (intervalo + resumo por visibilitychange + request en
 * curso) vive dentro de un único switchMap gateado por `enabled`: al cerrar
 * sesión, RxJS cancela todo de una vez (nada de setInterval/removeEventListener
 * manuales que puedan quedar corriendo o duplicarse).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);

  readonly toast = signal<string | null>(null);

  private since: string | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private queue: string[] = [];

  private readonly enabled = computed(() => !!this.authService.currentProfile());

  constructor() {
    toObservable(this.enabled)
      .pipe(
        switchMap((enabled): ObservableInput<unknown> => {
          if (!enabled) {
            this.reset();
            return EMPTY;
          }

          this.since = new Date().toISOString();

          // Los navegadores frenan los timers de pestañas en segundo plano; al volver
          // el foco, se sondea de una vez en lugar de esperar hasta el próximo tick.
          const resumed$ = fromEvent(document, 'visibilitychange').pipe(
            filter(() => document.visibilityState === 'visible'),
          );

          return merge(interval(POLL_MS), resumed$).pipe(switchMap(() => this.poll$()));
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private reset(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.queue = [];
    this.since = null;
    this.toast.set(null);
  }

  private poll$(): ObservableInput<unknown> {
    if (!this.since) return EMPTY;
    return this.ticketService.obtenerNotificaciones(this.since).pipe(
      filter((res) => !res.blnError && !!res.returnValue),
      switchMap((res) => {
        const { nuevosTickets, nuevosMensajes, serverTime } = res.returnValue!;
        this.since = serverTime;

        for (const t of nuevosTickets) {
          this.enqueue(`Nuevo ticket de ${t.userDisplayName || 'un usuario'}: ${t.subject}`);
        }
        for (const m of nuevosMensajes) {
          this.enqueue(`Nuevo mensaje en "${m.subject}" (#BR-${m.ticketNumber})`);
        }
        return EMPTY;
      }),
      // Un poll fallido (red, 401 en refresh, etc.) no debe tumbar todo el pipeline:
      // así como antes, se ignora y el siguiente tick del intervalo reintenta.
      catchError((err) => {
        console.warn('[NotificationService] poll falló', err);
        return EMPTY;
      }),
    );
  }

  private enqueue(msg: string): void {
    this.queue.push(msg);
    if (!this.toast()) this.showNext();
  }

  private showNext(): void {
    const next = this.queue.shift();
    if (!next) {
      this.toast.set(null);
      return;
    }
    this.toast.set(next);
    this.toastTimer = setTimeout(() => this.showNext(), TOAST_MS);
  }
}
