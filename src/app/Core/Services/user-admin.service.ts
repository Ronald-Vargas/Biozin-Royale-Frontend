import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { AdminUser, UserBlockInfo, BlockUserRequest } from '../Models/profile.models';

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly url = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<AdminUser[]>> {
    return this.http.get<ApiResponse<AdminUser[]>>(this.url);
  }

  getBlockInfo(userId: string): Observable<ApiResponse<UserBlockInfo>> {
    return this.http.get<ApiResponse<UserBlockInfo>>(`${this.url}/${userId}/block`);
  }

  blockUser(userId: string, data: BlockUserRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.url}/${userId}/block`, data);
  }

  unblockUser(userId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.url}/${userId}/block`);
  }
}
