import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { IniciarDepositoResultado } from '../Models/depositos.models';

@Injectable({ providedIn: 'root' })
export class DepositosService {
  private readonly url = `${environment.apiUrl}/depositos`;
  private readonly walletUrl = `${environment.apiUrl}/wallet`;

  constructor(private readonly http: HttpClient) {}

  iniciarStripe(amount: number): Observable<ApiResponse<IniciarDepositoResultado>> {
    return this.http.post<ApiResponse<IniciarDepositoResultado>>(
      `${this.url}/stripe/iniciar`,
      { amount }
    );
  }

  iniciarPayPal(amount: number): Observable<ApiResponse<IniciarDepositoResultado>> {
    return this.http.post<ApiResponse<IniciarDepositoResultado>>(
      `${this.url}/paypal/iniciar`,
      { amount }
    );
  }

  capturarPayPal(orderId: string): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(
      `${this.url}/paypal/capturar`,
      { orderId }
    );
  }

  getBalance(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.walletUrl}/balance`);
  }
}
