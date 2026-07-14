import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { ReportesKpiResultado } from '../Models/reportes.models';

export type ReportPeriod = 'd' | 'w' | 'm' | 'y';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly url = `${environment.apiUrl}/reportes`;

  constructor(private readonly http: HttpClient) {}

  getKpi(): Observable<ApiResponse<ReportesKpiResultado>> {
    return this.http.get<ApiResponse<ReportesKpiResultado>>(`${this.url}/kpi`);
  }

  downloadPdf(period: ReportPeriod): Observable<Blob> {
    return this.http.get(`${this.url}/pdf?period=${period}`, { responseType: 'blob' });
  }

  downloadExcel(period: ReportPeriod): Observable<Blob> {
    return this.http.get(`${this.url}/excel?period=${period}`, { responseType: 'blob' });
  }
}
