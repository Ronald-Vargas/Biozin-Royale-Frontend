import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { CrearTicketRequest, TicketResultado } from '../Models/ticket.models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly url = `${environment.apiUrl}/tickets`;

  constructor(private readonly http: HttpClient) {}

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
}
