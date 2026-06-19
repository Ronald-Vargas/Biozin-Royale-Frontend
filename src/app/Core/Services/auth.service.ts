import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  LoginManualRequest,
  PerfilResultado,
  RegistroManualRequest,
} from '../Models/auth.models';

const TOKEN_KEY = 'biozin_token';
const PROFILE_KEY = 'biozin_profile';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  readonly currentProfile = signal<PerfilResultado | null>(this.readStoredProfile());

  constructor(private readonly http: HttpClient) {}

  register(datos: RegistroManualRequest): Observable<ApiResponse<PerfilResultado>> {
    return this.http
      .post<ApiResponse<PerfilResultado>>(`${this.baseUrl}/register`, datos)
      .pipe(tap((res) => this.storeSession(res)));
  }

  login(datos: LoginManualRequest): Observable<ApiResponse<PerfilResultado>> {
    return this.http
      .post<ApiResponse<PerfilResultado>>(`${this.baseUrl}/login`, datos)
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    this.currentProfile.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private storeSession(res: ApiResponse<PerfilResultado>): void {
    if (res.blnError || !res.returnValue) return;

    if (res.returnValue.token) {
      localStorage.setItem(TOKEN_KEY, res.returnValue.token);
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(res.returnValue));
    this.currentProfile.set(res.returnValue);
  }

  private readStoredProfile(): PerfilResultado | null {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as PerfilResultado) : null;
  }
}