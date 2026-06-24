import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { HistorialJuegoResultado } from '../Models/games-history.models';

@Injectable({ providedIn: 'root' })
export class GamesHistoryService {
  private readonly historyUrl = `${environment.apiUrl}/gameshistory`;

  constructor(private readonly http: HttpClient) {}

  getHistory(): Observable<ApiResponse<HistorialJuegoResultado[]>> {
    return this.http.get<ApiResponse<HistorialJuegoResultado[]>>(this.historyUrl);
  }
}
