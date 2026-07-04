import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../Core/Models/auth.models';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private _balance = signal(0);
  readonly balance = this._balance.asReadonly();

  private readonly url = `${environment.apiUrl}/wallet/balance`;

  constructor(private readonly http: HttpClient) {}

  load(): void {
    this.http.get<ApiResponse<number>>(this.url).subscribe({
      next: (res) => {
        if (!res.blnError && res.returnValue !== null) {
          this._balance.set(res.returnValue);
        }
      },
    });
  }

  // Carga desde la API y devuelve el valor para poder usarlo directamente
  fetch(): Observable<number> {
    return this.http.get<ApiResponse<number>>(this.url).pipe(
      map(res => res.returnValue ?? 0),
      tap(b => this._balance.set(b)),
    );
  }

  // Persiste el saldo nuevo en la DB y actualiza el signal
  save(amount: number): Observable<number> {
    return this.http.put<ApiResponse<number>>(this.url, amount).pipe(
      map(res => res.returnValue ?? amount),
      tap(b => this._balance.set(b)),
    );
  }

  // Sólo actualiza el signal local (sin llamar la API)
  set(amount: number): void {
    this._balance.set(amount);
  }
}
