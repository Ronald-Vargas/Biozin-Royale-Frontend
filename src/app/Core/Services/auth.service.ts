import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse, LoginManualRequest, RegistroManualRequest } from '../Models/auth.models';
import { PerfilResultado } from '../Models/profile.models';

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

  /**
   * Llamado por el callback de OAuth justo después de que Supabase confirma la sesión.
   * El token de Supabase se manda explícito porque el interceptor todavía no tiene
   * nada guardado en este punto del flujo.
   */
  syncOAuth(supabaseAccessToken: string): Observable<ApiResponse<PerfilResultado>> {
    return this.http
      .post<ApiResponse<PerfilResultado>>(
        `${this.baseUrl}/sync`,
        {},
        { headers: { Authorization: `Bearer ${supabaseAccessToken}` } }
      )
      .pipe(tap((res) => this.storeSession(res, supabaseAccessToken)));
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

  // El backend solo manda `token` en register/login manual; en sync/get/update viene
  // null porque la sesión ya existe, así que mantenemos el que ya está guardado
  // (o el de Supabase, si se pasa como fallback explícito desde syncOAuth).
  // Pública porque ProfileService también la usa: GET/PUT /api/profile refrescan
  // el mismo perfil cacheado que login/sync.
  storeSession(res: ApiResponse<PerfilResultado>, fallbackToken?: string): void {
    if (res.blnError || !res.returnValue) return;

    const token = res.returnValue.token ?? fallbackToken ?? this.getToken();
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(res.returnValue));
    this.currentProfile.set(res.returnValue);
  }

  private readStoredProfile(): PerfilResultado | null {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as PerfilResultado) : null;
  }
}