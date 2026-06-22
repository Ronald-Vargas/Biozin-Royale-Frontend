import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { ActualizarPerfilRequest, EstadisticasResultado, PerfilResultado } from '../Models/profile.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly profileUrl = `${environment.apiUrl}/profile`;

  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {}

  getProfile(): Observable<ApiResponse<PerfilResultado>> {
    return this.http
      .get<ApiResponse<PerfilResultado>>(this.profileUrl)
      .pipe(tap((res) => this.authService.storeSession(res)));
  }

  updateProfile(datos: ActualizarPerfilRequest): Observable<ApiResponse<PerfilResultado>> {
    return this.http
      .put<ApiResponse<PerfilResultado>>(this.profileUrl, datos)
      .pipe(tap((res) => this.authService.storeSession(res)));
  }

  getStatistics(): Observable<ApiResponse<EstadisticasResultado>> {
    return this.http.get<ApiResponse<EstadisticasResultado>>(`${this.profileUrl}/statistics`);
  }
}
