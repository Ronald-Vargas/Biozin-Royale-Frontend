import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { CrearPromocionRequest, OtorgarBonoRequest, Promotion, PromotionClaim } from '../Models/promotion.models';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private readonly url = `${environment.apiUrl}/promotions`;

  constructor(private readonly http: HttpClient) {}

  // ──────────── Jugador ────────────

  getActive(): Observable<ApiResponse<Promotion[]>> {
    return this.http.get<ApiResponse<Promotion[]>>(this.url);
  }

  claim(id: string): Observable<ApiResponse<PromotionClaim>> {
    return this.http.post<ApiResponse<PromotionClaim>>(`${this.url}/${id}/claim`, {});
  }

  getMyClaims(): Observable<ApiResponse<PromotionClaim[]>> {
    return this.http.get<ApiResponse<PromotionClaim[]>>(`${this.url}/my`);
  }

  // ──────────── Admin ────────────

  adminGetAll(): Observable<ApiResponse<Promotion[]>> {
    return this.http.get<ApiResponse<Promotion[]>>(`${this.url}/admin/all`);
  }

  adminCreate(data: CrearPromocionRequest): Observable<ApiResponse<Promotion>> {
    return this.http.post<ApiResponse<Promotion>>(`${this.url}/admin`, data);
  }

  adminToggle(id: string, extendDays?: number): Observable<ApiResponse<Promotion>> {
    return this.http.put<ApiResponse<Promotion>>(`${this.url}/admin/${id}/toggle`, { extendDays: extendDays ?? null });
  }

  adminGetUserClaims(userId: string): Observable<ApiResponse<PromotionClaim[]>> {
    return this.http.get<ApiResponse<PromotionClaim[]>>(`${this.url}/admin/users/${userId}/claims`);
  }

  adminGrant(userId: string, data: OtorgarBonoRequest): Observable<ApiResponse<PromotionClaim>> {
    return this.http.post<ApiResponse<PromotionClaim>>(`${this.url}/admin/grant/${userId}`, data);
  }
}
