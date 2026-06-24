import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  set(amount: number): void {
    this._balance.set(amount);
  }
}
