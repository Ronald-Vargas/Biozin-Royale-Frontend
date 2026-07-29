import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import {
  CrearTicketRequest, TicketResultado, TicketMessage,
  EnviarMensajeRequest, AsignarTicketRequest, CambiarEstadoRequest, StaffSimple,
} from '../Models/ticket.models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly url = `${environment.apiUrl}/tickets`;

  constructor(private readonly http: HttpClient) {}

  // ── Tickets ──────────────────────────────────────────────

  crear(datos: CrearTicketRequest): Observable<ApiResponse<TicketResultado>> {
    return this.http.post<ApiResponse<TicketResultado>>(this.url, datos);
  }

  listarMios(): Observable<ApiResponse<TicketResultado[]>> {
    return this.http.get<ApiResponse<TicketResultado[]>>(this.url);
  }

  listarTodos(): Observable<ApiResponse<TicketResultado[]>> {
    return this.http.get<ApiResponse<TicketResultado[]>>(this.url);
  }

  obtener(id: string): Observable<ApiResponse<TicketResultado>> {
    return this.http.get<ApiResponse<TicketResultado>>(`${this.url}/${id}`);
  }

  // ── Mensajes ─────────────────────────────────────────────

  listarMensajes(ticketId: string): Observable<ApiResponse<TicketMessage[]>> {
    return this.http.get<ApiResponse<TicketMessage[]>>(`${this.url}/${ticketId}/messages`);
  }

  enviarMensaje(ticketId: string, body: string, fileUrl?: string, fileName?: string): Observable<ApiResponse<TicketMessage>> {
    const payload: EnviarMensajeRequest = { body, fileUrl, fileName };
    return this.http.post<ApiResponse<TicketMessage>>(`${this.url}/${ticketId}/messages`, payload);
  }

  // ── Gestión ──────────────────────────────────────────────

  asignar(ticketId: string, staffMemberId: string): Observable<ApiResponse<TicketResultado>> {
    return this.http.patch<ApiResponse<TicketResultado>>(`${this.url}/${ticketId}/assign`, { staffMemberId } as AsignarTicketRequest);
  }

  cambiarEstado(ticketId: string, status: string): Observable<ApiResponse<TicketResultado>> {
    return this.http.patch<ApiResponse<TicketResultado>>(`${this.url}/${ticketId}/status`, { status } as CambiarEstadoRequest);
  }

  listarAgentes(): Observable<ApiResponse<StaffSimple[]>> {
    return this.http.get<ApiResponse<StaffSimple[]>>(`${this.url}/agents`);
  }

  reopen(ticketId: string): Observable<ApiResponse<TicketResultado>> {
    return this.http.post<ApiResponse<TicketResultado>>(`${this.url}/${ticketId}/reopen`, {});
  }

  rate(ticketId: string, rating: number): Observable<ApiResponse<TicketResultado>> {
    return this.http.post<ApiResponse<TicketResultado>>(`${this.url}/${ticketId}/rate`, { rating });
  }

  cerrar(ticketId: string): Observable<ApiResponse<TicketResultado>> {
    return this.http.post<ApiResponse<TicketResultado>>(`${this.url}/${ticketId}/cerrar`, {});
  }
}
