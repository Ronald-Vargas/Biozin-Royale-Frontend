import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Card } from 'src/app/User/blackjack/Cards/cards.logic';

// ── Tipos que llegan del BlackjackHub (snapshot público del servidor) ─────────
// El servidor es autoritativo: aquí no se calcula nada del juego, solo se
// tipa lo que llega. La carta oculta del crupier nunca viene en el snapshot.

export interface BjHandSnap {
  cards: Card[];
  bet: number;
  total: number;
  done: boolean;
  result: 'blackjack' | 'win' | 'push' | 'lose' | 'surrender' | null;
}

export interface BjChairSnap {
  index: number;
  type: 'player' | 'bot';
  userId?: string;
  name: string;
  avatar: string | null;
  connected?: boolean;
  bet: number;
  hands: BjHandSnap[] | null;
  activeHand: number;
}

export type BjState =
  | 'waiting' | 'lobby' | 'starting' | 'betting' | 'dealing' | 'acting' | 'dealer' | 'settled';

export interface BjSnapshot {
  roomId: number;
  state: BjState;
  phaseEndsUtc: string | null;
  min: number;
  max: number;
  turnChair: number | null;
  isPrivate?: boolean;
  inviteCode?: string | null;
  ownerUserId?: string | null;
  dealer: { cards: Card[]; hole: boolean; total: number | null };
  chairs: (BjChairSnap | null)[];
  spectators: { userId: string; name: string }[];
}

export interface BjLobbyRoom {
  id: number;
  min: number;
  max: number;
  players: number;
  maxPlayers: number;
  state: string;
  /** Fin del countdown pre-ronda (starting/betting); null si la mesa está jugando */
  phaseEndsUtc: string | null;
}

export interface BjRoundResult {
  payout: number;
  profit: number;
  newBalance: number | null;
}

/** Mensaje de chat rápido: el texto lo resuelve el servidor desde su lista fija */
export interface BjChatMessage {
  chair: number;
  name: string;
  userId: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class BlackjackRealtimeService {
  private hub: HubConnection | null = null;
  private currentRoomId: number | null = null;
  /** Crece con cada evento "state": detecta si el resultado de un invoke quedó viejo */
  private stateSeq = 0;

  readonly lobby = signal<BjLobbyRoom[]>([]);
  readonly room = signal<BjSnapshot | null>(null);
  readonly lastResult = signal<BjRoundResult | null>(null);
  readonly kicked = signal<string | null>(null);
  /** Stream (no signal): dos mensajes iguales seguidos deben emitirse ambos */
  readonly chat$ = new Subject<BjChatMessage>();

  constructor(private readonly auth: AuthService) {}

  /** El hub vive en la raíz del API (fuera de /api): .../hubs/blackjack */
  private get hubUrl(): string {
    return environment.apiUrl.replace(/\/api$/, '') + '/hubs/blackjack';
  }

  /** userId real de la sesión (claim "sub" del JWT) — el mismo que usa el hub */
  get myUserId(): string | null {
    const token = this.auth.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  async connect(): Promise<void> {
    if (this.hub && this.hub.state !== HubConnectionState.Disconnected) return;

    this.hub = new HubConnectionBuilder()
      .withUrl(this.hubUrl, { accessTokenFactory: () => this.auth.getToken() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.hub.on('lobby', (rooms: BjLobbyRoom[]) => this.lobby.set(rooms));
    this.hub.on('state', (snap: BjSnapshot) => {
      this.stateSeq++;
      this.room.set(snap);
    });
    this.hub.on('roundResult', (r: BjRoundResult) => this.lastResult.set(r));
    this.hub.on('kicked', (msg: string) => this.kicked.set(msg));
    this.hub.on('chat', (m: BjChatMessage) => this.chat$.next(m));

    // Tras una reconexión automática la conexión es nueva para el servidor:
    // hay que volver a entrar a la mesa para recuperar silla y grupo
    this.hub.onreconnected(async () => {
      if (this.currentRoomId !== null) {
        try {
          const seqAntes = this.stateSeq;
          const snap = await this.hub!.invoke<BjSnapshot>('JoinRoom', this.currentRoomId);
          if (this.stateSeq === seqAntes) this.room.set(snap);
        } catch {
          this.room.set(null);
          this.currentRoomId = null;
        }
      }
    });

    await this.hub.start();
  }

  async disconnect(): Promise<void> {
    this.currentRoomId = null;
    this.room.set(null);
    if (this.hub) {
      await this.hub.stop().catch(() => {});
      this.hub = null;
    }
  }

  // ── Lobby ──────────────────────────────────────────────────────────────────

  async joinLobby(): Promise<void> {
    await this.connect();
    const rooms = await this.hub!.invoke<BjLobbyRoom[]>('JoinLobby');
    this.lobby.set(rooms);
  }

  async leaveLobby(): Promise<void> {
    if (this.hub?.state === HubConnectionState.Connected) {
      await this.hub.invoke('LeaveLobby').catch(() => {});
    }
  }

  // ── Mesa ───────────────────────────────────────────────────────────────────

  async joinRoom(roomId: number): Promise<void> {
    await this.connect();
    const seqAntes = this.stateSeq;
    const snap = await this.hub!.invoke<BjSnapshot>('JoinRoom', roomId);
    this.currentRoomId = roomId;
    // El loop de la sala pudo emitir un "state" más nuevo mientras el invoke
    // volvía: en ese caso el snapshot del invoke ya está viejo y no debe pisar
    if (this.stateSeq === seqAntes) this.room.set(snap);
  }

  async leaveRoom(): Promise<void> {
    this.currentRoomId = null;
    this.room.set(null);
    if (this.hub?.state === HubConnectionState.Connected) {
      await this.hub.invoke('LeaveRoom').catch(() => {});
    }
  }

  placeBet(amount: number): Promise<void> {
    return this.hub!.invoke('PlaceBet', amount);
  }

  // ── Mesas privadas ─────────────────────────────────────────────────────────

  async createPrivateRoom(min: number, max: number, fillWithBots: boolean): Promise<number> {
    await this.connect();
    const res = await this.hub!.invoke<{ roomId: number; snapshot: BjSnapshot }>(
      'CreatePrivateRoom', min, max, fillWithBots);
    this.currentRoomId = res.roomId;
    this.room.set(res.snapshot);
    return res.roomId;
  }

  async joinByCode(code: string): Promise<number> {
    await this.connect();
    const res = await this.hub!.invoke<{ roomId: number; snapshot: BjSnapshot }>(
      'JoinByCode', code.trim().toUpperCase());
    this.currentRoomId = res.roomId;
    this.room.set(res.snapshot);
    return res.roomId;
  }

  startGame(): Promise<void> {
    return this.hub!.invoke('StartGame');
  }

  action(action: 'hit' | 'stand' | 'double' | 'split' | 'surrender'): Promise<void> {
    return this.hub!.invoke('Action', action);
  }

  /** Solo el índice: el servidor valida y resuelve el texto */
  quickChat(index: number): Promise<void> {
    return this.hub!.invoke('QuickChat', index);
  }
}
