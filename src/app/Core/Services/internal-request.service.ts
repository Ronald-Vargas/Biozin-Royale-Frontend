import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { StaffSimple } from '../Models/ticket.models';
import {
  CrearInternalRequestRequest, InternalRequestResultado, InternalRequestMessage,
  EnviarInternalRequestMensajeRequest, CambiarEstadoInternalRequestRequest,
} from '../Models/internal-request.models';

@Injectable({ providedIn: 'root' })
export class InternalRequestService {
  private readonly url = `${environment.apiUrl}/internal-requests`;

  constructor(private readonly http: HttpClient) {}

  // ── Solicitudes ──────────────────────────────────────────

  crear(datos: CrearInternalRequestRequest): Observable<ApiResponse<InternalRequestResultado>> {
    return this.http.post<ApiResponse<InternalRequestResultado>>(this.url, datos);
  }

  listarMias(): Observable<ApiResponse<InternalRequestResultado[]>> {
    return this.http.get<ApiResponse<InternalRequestResultado[]>>(this.url);
  }

  listarParaMi(): Observable<ApiResponse<InternalRequestResultado[]>> {
    return this.http.get<ApiResponse<InternalRequestResultado[]>>(this.url);
  }

  obtener(id: string): Observable<ApiResponse<InternalRequestResultado>> {
    return this.http.get<ApiResponse<InternalRequestResultado>>(`${this.url}/${id}`);
  }

  listarAdmins(): Observable<ApiResponse<StaffSimple[]>> {
    return this.http.get<ApiResponse<StaffSimple[]>>(`${this.url}/admins`);
  }

  // ── Mensajes ─────────────────────────────────────────────

  listarMensajes(id: string): Observable<ApiResponse<InternalRequestMessage[]>> {
    return this.http.get<ApiResponse<InternalRequestMessage[]>>(`${this.url}/${id}/messages`);
  }

  enviarMensaje(id: string, body: string): Observable<ApiResponse<InternalRequestMessage>> {
    const payload: EnviarInternalRequestMensajeRequest = { body };
    return this.http.post<ApiResponse<InternalRequestMessage>>(`${this.url}/${id}/messages`, payload);
  }

  // ── Gestión ──────────────────────────────────────────────

  cambiarEstado(id: string, status: string): Observable<ApiResponse<InternalRequestResultado>> {
    return this.http.patch<ApiResponse<InternalRequestResultado>>(`${this.url}/${id}/status`, { status } as CambiarEstadoInternalRequestRequest);
  }
}
