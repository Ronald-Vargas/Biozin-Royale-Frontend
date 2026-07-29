import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import {
  MetodoPago,
  AgregarPayPalRequest,
  AgregarTarjetaRequest,
  IniciarRetiroRequest,
  RetiroResultado,
} from '../Models/metodos-pago.models';

@Injectable({ providedIn: 'root' })
export class MetodosPagoService {
  private readonly base      = `${environment.apiUrl}/metodos-pago`;
  private readonly retirosUrl = `${environment.apiUrl}/retiros`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ApiResponse<MetodoPago[]>> {
    return this.http.get<ApiResponse<MetodoPago[]>>(this.base);
  }

  agregarPayPal(req: AgregarPayPalRequest): Observable<ApiResponse<MetodoPago>> {
    return this.http.post<ApiResponse<MetodoPago>>(`${this.base}/paypal`, req);
  }

  agregarTarjeta(req: AgregarTarjetaRequest): Observable<ApiResponse<MetodoPago>> {
    return this.http.post<ApiResponse<MetodoPago>>(`${this.base}/tarjeta`, req);
  }

  eliminar(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }

  establecerPrincipal(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${id}/principal`, {});
  }

  retirar(req: IniciarRetiroRequest): Observable<ApiResponse<RetiroResultado>> {
    return this.http.post<ApiResponse<RetiroResultado>>(this.retirosUrl, req);
  }
}
