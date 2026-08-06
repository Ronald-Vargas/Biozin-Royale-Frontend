import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';

export interface SlotsHit {
  lineIndex: number;
  length: number;
  symbol: string;
  amount: number;
}

export interface SlotsSpinResult {
  grid: string[][];
  win: number;
  newBalance: number;
  bigWin: boolean;
  hits: SlotsHit[];
}

@Injectable({ providedIn: 'root' })
export class SlotsService {
  private readonly url = `${environment.apiUrl}/slots`;

  constructor(private readonly http: HttpClient) {}

  spin(bet: number): Observable<ApiResponse<SlotsSpinResult>> {
    return this.http.post<ApiResponse<SlotsSpinResult>>(`${this.url}/spin`, { bet });
  }
}
