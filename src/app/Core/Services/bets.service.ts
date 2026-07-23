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

export type MyBetStatus = 'pending' | 'won' | 'lost';

export interface MyBetSelection {
  team1: string;
  team2: string;
  league: string;
  outcome: string;
  odds: number;
  status: MyBetStatus;
}

export interface MyBet {
  id: string;
  amount: number;
  totalOdds: number;
  potentialWin: number;
  status: MyBetStatus;
  payout: number;
  createdAt: string;
  settledAt: string | null;
  selections: MyBetSelection[];
}

@Injectable({ providedIn: 'root' })
export class BetsService {
  private readonly url = `${environment.apiUrl}/bets`;

  constructor(private readonly http: HttpClient) {}

  placeBet(request: BetRequest): Observable<ApiResponse<BetResult>> {
    return this.http.post<ApiResponse<BetResult>>(this.url, request);
  }

  getMyBets(): Observable<ApiResponse<MyBet[]>> {
    return this.http.get<ApiResponse<MyBet[]>>(`${this.url}/mine`);
  }
}
