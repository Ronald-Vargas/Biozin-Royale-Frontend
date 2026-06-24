import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../Core/Models/auth.models';
import { SportMatch } from './sports.data';

@Injectable({ providedIn: 'root' })
export class SportsService {
  private readonly url = `${environment.apiUrl}/sports/matches`;

  constructor(private readonly http: HttpClient) {}

  getMatches(): Observable<ApiResponse<SportMatch[]>> {
    return this.http.get<ApiResponse<SportMatch[]>>(this.url);
  }
}
