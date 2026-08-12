import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { NuevoMensajeNotif, NuevoTicketNotif } from '../Models/ticket.models';

// Notificaciones app-wide (reemplaza el polling de cada 8s): el mismo ChatHub
// que los chats de soporte, pero unido automáticamente al grupo de notificaciones
// del rol al conectar (ver ChatHub.OnConnectedAsync en el backend). A diferencia
// de ChatRealtimeService, esta conexión se abre/cierra explícitamente según haya
// sesión activa, en vez de quedar abierta indefinidamente tras el primer uso.
@Injectable({ providedIn: 'root' })
export class NotificationRealtimeService {
  private hub: HubConnection | null = null;

  readonly nuevoTicket$ = new Subject<NuevoTicketNotif>();
  readonly nuevoMensaje$ = new Subject<NuevoMensajeNotif>();

  constructor(private readonly auth: AuthService) {}

  private get hubUrl(): string {
    return environment.apiUrl.replace(/\/api$/, '') + '/hubs/chat';
  }

  async connect(): Promise<void> {
    if (this.hub && this.hub.state !== HubConnectionState.Disconnected) return;

    this.hub = new HubConnectionBuilder()
      .withUrl(this.hubUrl, { accessTokenFactory: () => this.auth.getToken() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.hub.on('nuevoTicket', (p: NuevoTicketNotif) => this.nuevoTicket$.next(p));
    this.hub.on('nuevoMensaje', (p: NuevoMensajeNotif) => this.nuevoMensaje$.next(p));

    await this.hub.start();
  }

  async disconnect(): Promise<void> {
    const hub = this.hub;
    this.hub = null;
    if (hub) await hub.stop();
  }
}
