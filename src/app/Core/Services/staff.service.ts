import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { PerfilResultado } from '../Models/profile.models';
import { ActualizarStaffMemberRequest, CrearStaffMemberRequest } from '../Models/staff.models';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly staffUrl = `${environment.apiUrl}/staff`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<ApiResponse<PerfilResultado[]>> {
    return this.http.get<ApiResponse<PerfilResultado[]>>(this.staffUrl);
  }

  create(datos: CrearStaffMemberRequest): Observable<ApiResponse<PerfilResultado>> {
    return this.http.post<ApiResponse<PerfilResultado>>(this.staffUrl, datos);
  }

  getById(id: string): Observable<ApiResponse<PerfilResultado>> {
    return this.http.get<ApiResponse<PerfilResultado>>(`${this.staffUrl}/${id}`);
  }

  updateById(id: string, datos: ActualizarStaffMemberRequest): Observable<ApiResponse<PerfilResultado>> {
    return this.http.put<ApiResponse<PerfilResultado>>(`${this.staffUrl}/${id}`, datos);
  }

  changeStatus(id: string, status: 'active' | 'inactive'): Observable<ApiResponse<PerfilResultado>> {
    return this.http.put<ApiResponse<PerfilResultado>>(`${this.staffUrl}/${id}/status`, { status });
  }

  deleteById(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.staffUrl}/${id}`);
  }

  getMe(): Observable<ApiResponse<PerfilResultado>> {
    return this.http.get<ApiResponse<PerfilResultado>>(`${this.staffUrl}/me`);
  }

  updateMe(datos: ActualizarStaffMemberRequest): Observable<ApiResponse<PerfilResultado>> {
    return this.http.put<ApiResponse<PerfilResultado>>(`${this.staffUrl}/me`, datos);
  }
}
