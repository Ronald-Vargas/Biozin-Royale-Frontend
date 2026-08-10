import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../Models/auth.models';
import { AvatarResultado } from '../Models/profile.models';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  private readonly url = `${environment.apiUrl}/avatars`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<ApiResponse<AvatarResultado[]>> {
    return this.http.get<ApiResponse<AvatarResultado[]>>(this.url);
  }

  actualizar(avatarId: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.url}/${avatarId}`, {});
  }
}
