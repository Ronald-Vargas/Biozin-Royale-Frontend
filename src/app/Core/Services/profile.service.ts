import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { ActualizarPerfilRequest, EstadisticasResultado, PerfilResultado, SessionResultado, SecurityEventResultado } from '../Models/profile.models';
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

  changePassword(oldPassword: string, newPassword: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.profileUrl}/password`, { oldPassword, newPassword });
  }

  createPin(pin: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.profileUrl}/pin`, { pin });
  }

  changePin(oldPin: string, newPin: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.profileUrl}/pin`, { oldPin, newPin });
  }

  setPinEnabled(pin: string, enabled: boolean): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.profileUrl}/pin/estado`, { pin, enabled });
  }

  verifyPin(pin: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.profileUrl}/pin/verificar`, { pin });
  }

  setTwoFactorEnabled(password: string, enabled: boolean, code?: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.profileUrl}/2fa/estado`, { password, enabled, code });
  }

  sendTwoFactorDisableCode(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.profileUrl}/2fa/desactivar/codigo`, {});
  }

  checkUsername(username: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.profileUrl}/check-username`, {
      params: { username },
    });
  }

  getSessions(): Observable<ApiResponse<SessionResultado[]>> {
    return this.http.get<ApiResponse<SessionResultado[]>>(`${this.profileUrl}/sessions`);
  }

  closeSession(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.profileUrl}/sessions/${id}`);
  }

  closeOtherSessions(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.profileUrl}/sessions/close-others`, {});
  }

  getSecurityHistory(): Observable<ApiResponse<SecurityEventResultado[]>> {
    return this.http.get<ApiResponse<SecurityEventResultado[]>>(`${this.profileUrl}/security-history`);
  }
}
