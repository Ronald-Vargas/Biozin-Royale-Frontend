import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { WalletTransactionResultado } from '../Models/wallet-transaction.models';

@Injectable({ providedIn: 'root' })
export class WalletTransactionService {
  private readonly url = `${environment.apiUrl}/wallet/transactions`;

  constructor(private readonly http: HttpClient) {}

  getTransactions(): Observable<ApiResponse<WalletTransactionResultado[]>> {
    return this.http.get<ApiResponse<WalletTransactionResultado[]>>(this.url);
  }

  adminGetTransactions(userId: string): Observable<ApiResponse<WalletTransactionResultado[]>> {
    return this.http.get<ApiResponse<WalletTransactionResultado[]>>(
      `${environment.apiUrl}/wallet/admin/${userId}/transactions`
    );
  }
}
