import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { AdminUser } from '../Models/profile.models';

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly url = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<AdminUser[]>> {
    return this.http.get<ApiResponse<AdminUser[]>>(this.url);
  }
}
