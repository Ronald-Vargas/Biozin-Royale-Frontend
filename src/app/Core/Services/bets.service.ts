import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../Core/Models/auth.models';

export interface BetRequest {
  amount: number;
  totalOdds: number;
  selections: BetSelection[];
}

export interface BetSelection {
  matchId: number;
  team1: string;
  team2: string;
  league: string;
  outcome: string;
  odds: number;
}

export interface BetResult {
  betId: string;
  newBalance: number;
  potentialWin: number;
}

@Injectable({ providedIn: 'root' })
export class BetsService {
  private readonly url = `${environment.apiUrl}/bets`;

  constructor(private readonly http: HttpClient) {}

  placeBet(request: BetRequest): Observable<ApiResponse<BetResult>> {
    return this.http.post<ApiResponse<BetResult>>(this.url, request);
  }
}
