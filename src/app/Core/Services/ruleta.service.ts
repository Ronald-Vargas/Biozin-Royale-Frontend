import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';

export interface RuletaSpinResult {
  winningNumber: number;
  win:           number;
  newBalance:    number;
}

@Injectable({ providedIn: 'root' })
export class RuletaService {
  private readonly url = `${environment.apiUrl}/ruleta`;

  constructor(private readonly http: HttpClient) {}

  spin(bets: Record<string, number>): Observable<ApiResponse<RuletaSpinResult>> {
    return this.http.post<ApiResponse<RuletaSpinResult>>(`${this.url}/spin`, { bets });
  }
}
