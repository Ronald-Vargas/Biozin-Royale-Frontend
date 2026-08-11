import { Injectable, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { TicketService } from './ticket.service';

const POLL_MS = 8000;
const TOAST_MS = 3200;

/**
 * Notificaciones dentro de la app (sin push) para admin/soporte: sondea
 * tickets/mensajes nuevos y los muestra como toasts momentáneos. Solo
 * corre mientras el perfil activo tenga rol admin o soporte.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);

  readonly toast = signal<string | null>(null);

  private since: string | null = null;
  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private queue: string[] = [];

  constructor() {
    effect(() => {
      const role = this.authService.currentProfile()?.role;
      if (role === 'admin' || role === 'soporte') {
        this.start();
      } else {
        this.stop();
      }
    });
  }

  private start(): void {
    if (this.pollHandle) return;
    this.since = new Date().toISOString();
    this.pollHandle = setInterval(() => this.poll(), POLL_MS);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private stop(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.queue = [];
    this.since = null;
    this.toast.set(null);
  }

  // Los navegadores frenan los setInterval de pestañas en segundo plano; al volver
  // el foco, se sondea de una vez en lugar de esperar hasta el próximo tick.
  private readonly onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') this.poll();
  };

  private poll(): void {
    if (!this.since) return;
    this.ticketService.obtenerNotificaciones(this.since).subscribe({
      next: (res) => {
        if (res.blnError || !res.returnValue) return;
        const { nuevosTickets, nuevosMensajes, serverTime } = res.returnValue;
        this.since = serverTime;

        for (const t of nuevosTickets) {
          this.enqueue(`Nuevo ticket de ${t.userDisplayName || 'un usuario'}: ${t.subject}`);
        }
        for (const m of nuevosMensajes) {
          this.enqueue(`Nuevo mensaje en "${m.subject}" (#BR-${m.ticketNumber})`);
        }
      },
      error: (err) => console.warn('[NotificationService] poll falló', err),
    });
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
