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
import { TicketMessage, TicketResultado } from '../Models/ticket.models';
import { InternalRequestMessage, InternalRequestResultado } from '../Models/internal-request.models';

type Grupo = { tipo: 'ticket' | 'solicitud'; id: string };

// Tiempo real de los chats de soporte (reemplaza el polling de cada 4s):
// tickets usuario↔soporte y solicitudes internas soporte↔admin. Los eventos
// los emite el backend DESPUÉS de persistir por la API REST — este servicio
// solo escucha; enviar mensajes sigue siendo por HTTP.
@Injectable({ providedIn: 'root' })
export class ChatRealtimeService {
  private hub: HubConnection | null = null;
  private grupo: Grupo | null = null;

  readonly ticketMensaje$ = new Subject<{ ticketId: string; mensaje: TicketMessage }>();
  readonly ticketActualizado$ = new Subject<TicketResultado>();
  readonly solicitudMensaje$ = new Subject<{ solicitudId: string; mensaje: InternalRequestMessage }>();
  readonly solicitudActualizada$ = new Subject<InternalRequestResultado>();
  /** Tras una reconexión pudieron perderse mensajes: recargar la lista una vez */
  readonly reconectado$ = new Subject<void>();

  constructor(private readonly auth: AuthService) {}

  private get hubUrl(): string {
    return environment.apiUrl.replace(/\/api$/, '') + '/hubs/chat';
  }

  private async connect(): Promise<void> {
    if (this.hub && this.hub.state !== HubConnectionState.Disconnected) return;

    this.hub = new HubConnectionBuilder()
      .withUrl(this.hubUrl, { accessTokenFactory: () => this.auth.getToken() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.hub.on('ticketMensaje', (p: { ticketId: string; mensaje: TicketMessage }) =>
      this.ticketMensaje$.next(p));
    this.hub.on('ticketActualizado', (t: TicketResultado) =>
      this.ticketActualizado$.next(t));
    this.hub.on('solicitudMensaje', (p: { solicitudId: string; mensaje: InternalRequestMessage }) =>
      this.solicitudMensaje$.next(p));
    this.hub.on('solicitudActualizada', (r: InternalRequestResultado) =>
      this.solicitudActualizada$.next(r));

    // Tras reconectar, la conexión es nueva para el servidor: volver al grupo
    // y avisar al componente para que recargue lo que se haya perdido
    this.hub.onreconnected(async () => {
      if (this.grupo) {
        const metodo = this.grupo.tipo === 'ticket' ? 'JoinTicket' : 'JoinSolicitud';
        await this.hub!.invoke(metodo, this.grupo.id).catch(() => {});
        this.reconectado$.next();
      }
    });

    await this.hub.start();
  }

  async joinTicket(ticketId: string): Promise<void> {
    await this.connect();
    await this.hub!.invoke('JoinTicket', ticketId);
    this.grupo = { tipo: 'ticket', id: ticketId };
  }

  async joinSolicitud(solicitudId: string): Promise<void> {
    await this.connect();
    await this.hub!.invoke('JoinSolicitud', solicitudId);
    this.grupo = { tipo: 'solicitud', id: solicitudId };
  }

  async leave(): Promise<void> {
    const g = this.grupo;
    this.grupo = null;
    if (g && this.hub?.state === HubConnectionState.Connected) {
      const metodo = g.tipo === 'ticket' ? 'LeaveTicket' : 'LeaveSolicitud';
      await this.hub.invoke(metodo, g.id).catch(() => {});
    }
  }
}
