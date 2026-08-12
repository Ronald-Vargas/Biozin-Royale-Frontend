import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, ObservableInput, filter, finalize, fromEvent, merge, switchMap, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationRealtimeService } from './notification-realtime.service';

const TOAST_MS = 3200;
const RECONNECT_MS = 5000;
const PREF_KEY = 'biozin_notifs_enabled';

/**
 * Notificaciones dentro de la app: escucha tickets/mensajes/solicitudes nuevas
 * por SignalR (ver `NotificationRealtimeService`) y los muestra como toasts
 * momentáneos. Corre mientras haya un perfil activo (cualquier rol) —
 * admin/soporte reciben tickets y mensajes nuevos de todos los usuarios, y
 * solicitudes internas nuevas entre ellos; un usuario normal solo recibe
 * respuestas nuevas de soporte en sus propios tickets (el backend decide el
 * alcance según el rol, ver `ChatHub.OnConnectedAsync`).
 *
 * Todo vive dentro de un único switchMap gateado por `enabled`: al cerrar
 * sesión, RxJS cierra la conexión y cancela la suscripción de una vez (nada de
 * estado manual que pueda quedar corriendo o duplicarse).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly authService = inject(AuthService);
  private readonly realtime = inject(NotificationRealtimeService);

  readonly toast = signal<string | null>(null);

  // Preferencia del botón "Notificaciones" en Ajustes (admin/soporte): se guarda
  // por dispositivo, no por perfil — es un mute local, no una config de servidor.
  readonly notifsEnabled = signal<boolean>(this.readPreference());

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private queue: string[] = [];

  private readonly enabled = computed(
    () => !!this.authService.currentProfile() && this.notifsEnabled(),
  );

  constructor() {
    toObservable(this.enabled)
      .pipe(
        switchMap((enabled): ObservableInput<unknown> => {
          if (!enabled) {
            this.reset();
            return EMPTY;
          }

          this.tryConnect();

          // Los navegadores frenan (o el SO mata) la conexión de una pestaña/app en
          // segundo plano; al volver el foco, `connect()` es un no-op si sigue viva
          // y reconecta si no (p. ej. el token quedó vencido mientras estaba en
          // background) — mismo resguardo que tenía el polling con visibilitychange.
          const resumed$ = fromEvent(document, 'visibilitychange').pipe(
            filter(() => document.visibilityState === 'visible'),
            tap(() => this.tryConnect()),
          );

          const nuevoTicket$ = this.realtime.nuevoTicket$.pipe(
            tap((t) => this.enqueue(`Nuevo ticket de ${t.userDisplayName || 'un usuario'}: ${t.subject}`)),
          );
          const nuevoMensaje$ = this.realtime.nuevoMensaje$.pipe(
            tap((m) => this.enqueue(`Nuevo mensaje en "${m.subject}" (#BR-${m.ticketNumber})`)),
          );
          // admin y soporte comparten un único grupo de notificaciones (notif:staff,
          // ver ChatHub.OnConnectedAsync), así que quien crea la solicitud o envía el
          // mensaje también recibiría su propio evento si no se filtra aquí.
          const miId = this.authService.currentProfile()?.id;
          const nuevaSolicitud$ = this.realtime.nuevaSolicitud$.pipe(
            filter((s) => s.requestedById !== miId),
            tap((s) => this.enqueue(`Nueva solicitud de ${s.requestedByName || 'soporte'}: ${s.subject}`)),
          );
          const nuevoMensajeSolicitud$ = this.realtime.nuevoMensajeSolicitud$.pipe(
            filter((m) => m.senderId !== miId),
            tap((m) => this.enqueue(`Nuevo mensaje en "${m.subject}" (#SOL-${m.requestNumber})`)),
          );

          return merge(resumed$, nuevoTicket$, nuevoMensaje$, nuevaSolicitud$, nuevoMensajeSolicitud$).pipe(
            finalize(() => this.realtime.disconnect()),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  setNotifsEnabled(v: boolean): void {
    this.notifsEnabled.set(v);
    localStorage.setItem(PREF_KEY, JSON.stringify(v));
  }

  private readPreference(): boolean {
    const raw = localStorage.getItem(PREF_KEY);
    return raw === null ? true : JSON.parse(raw);
  }

  // `withAutomaticReconnect()` cubre caídas breves, pero se rinde tras un rato y
  // no cubre un intento inicial fallido (p. ej. token vencido en cold start). Si
  // falla, reintenta solo mientras la sesión siga activa.
  private tryConnect(): void {
    this.realtime.connect().catch((err) => {
      console.warn('[NotificationService] no se pudo conectar, reintentando', err);
      setTimeout(() => {
        if (this.enabled()) this.tryConnect();
      }, RECONNECT_MS);
    });
  }

  private reset(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.queue = [];
    this.toast.set(null);
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
