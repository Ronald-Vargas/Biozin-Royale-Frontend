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

type TipoGrupo = 'ticket' | 'solicitud';

// Tiempo real de los chats de soporte (reemplaza el polling de cada 4s):
// tickets usuario↔soporte y solicitudes internas soporte↔admin. Los eventos
// los emite el backend DESPUÉS de persistir por la API REST — este servicio
// solo escucha; enviar mensajes sigue siendo por HTTP.
@Injectable({ providedIn: 'root' })
export class ChatRealtimeService {
  private hub: HubConnection | null = null;

  // Grupos activos, indexados por clave "tipo:id". Se usa una colección y no un
  // único valor porque las animaciones de ruta mantienen vivos dos componentes de
  // chat durante la transición: si se abandonara "el grupo actual", el componente
  // que se destruye sacaría al usuario del chat que acaba de abrir, dejándolo sin
  // mensajes en vivo hasta recargar la página.
  private grupos = new Map<string, { tipo: TipoGrupo; id: string }>();

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

  /** Promesa del arranque en curso, para que dos llamadas no abran dos conexiones. */
  private arranque: Promise<void> | null = null;

  private async connect(): Promise<void> {
    if (this.hub?.state === HubConnectionState.Connected) return;

    // Estados intermedios: si se retornara aquí sin esperar, el invoke posterior
    // fallaría con "connection is not in the 'Connected' State" y el componente
    // nunca entraría a su grupo (chat mudo hasta recargar la página).
    if (this.hub && (this.hub.state === HubConnectionState.Connecting
                  || this.hub.state === HubConnectionState.Reconnecting)) {
      return this.esperarConectado();
    }

    if (this.arranque) return this.arranque;
    this.arranque = this.crearYArrancar();
    try { await this.arranque; }
    finally { this.arranque = null; }
  }

  /** Espera a que una conexión en curso (o reconexión automática) quede lista. */
  private esperarConectado(timeoutMs = 15000): Promise<void> {
    return new Promise((resolve, reject) => {
      const inicio = Date.now();
      const t = setInterval(() => {
        if (this.hub?.state === HubConnectionState.Connected) { clearInterval(t); resolve(); }
        else if (this.hub?.state === HubConnectionState.Disconnected) {
          clearInterval(t); reject(new Error('La conexión de chat se cerró.'));
        } else if (Date.now() - inicio > timeoutMs) {
          clearInterval(t); reject(new Error('Tiempo de espera agotado al conectar el chat.'));
        }
      }, 120);
    });
  }

  private async crearYArrancar(): Promise<void> {
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

    // Tras reconectar, la conexión es nueva para el servidor: hay que volver a
    // entrar a TODOS los grupos activos y avisar para recargar lo perdido.
    this.hub.onreconnected(async () => {
      if (this.grupos.size === 0) return;

      for (const { tipo, id } of this.grupos.values()) {
        await this.hub!
          .invoke(tipo === 'ticket' ? 'JoinTicket' : 'JoinSolicitud', id)
          .catch(() => {});
      }
      this.reconectado$.next();
    });

    await this.hub.start();
  }

  joinTicket(ticketId: string): Promise<void> {
    return this.join('ticket', ticketId);
  }

  joinSolicitud(solicitudId: string): Promise<void> {
    return this.join('solicitud', solicitudId);
  }

  /** Abandona el grupo indicado. Cada componente sale del que él mismo abrió. */
  leaveTicket(ticketId: string): Promise<void> {
    return this.leave('ticket', ticketId);
  }

  leaveSolicitud(solicitudId: string): Promise<void> {
    return this.leave('solicitud', solicitudId);
  }

  private clave(tipo: TipoGrupo, id: string): string {
    return `${tipo}:${id.toLowerCase()}`;
  }

  private async join(tipo: TipoGrupo, id: string): Promise<void> {
    await this.connect();
    await this.hub!.invoke(tipo === 'ticket' ? 'JoinTicket' : 'JoinSolicitud', id);
    this.grupos.set(this.clave(tipo, id), { tipo, id });
  }

  private async leave(tipo: TipoGrupo, id: string): Promise<void> {
    // Si no figura como activo, no hay nada que abandonar: evita que un
    // componente en destrucción saque al usuario de un grupo que no era suyo.
    if (!this.grupos.delete(this.clave(tipo, id))) return;

    if (this.hub?.state === HubConnectionState.Connected) {
      await this.hub.invoke(tipo === 'ticket' ? 'LeaveTicket' : 'LeaveSolicitud', id)
        .catch(() => {});
    }
  }
}
