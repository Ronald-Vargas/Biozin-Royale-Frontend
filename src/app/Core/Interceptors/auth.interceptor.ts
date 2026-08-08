import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../Services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Si la llamada ya trae su propio Authorization (ej. syncOAuth, que necesita mandar
  // el token de Supabase explícito en vez del guardado), no lo pisamos.
  if (req.headers.has('Authorization')) return next(req);

  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // X-Auth-Retry está presente en dos casos:
      // 1. La propia llamada a /auth/refresh (la marcamos así desde refreshTokens())
      // 2. El retry de la request original con el nuevo token
      // En ambos casos no intentamos refrescar de nuevo: propagamos el error para
      // que lo capture el catchError del pipe de refreshTokens() → logout.
      if (err.status === 401 && authService.getToken() && !req.headers.has('X-Auth-Retry')) {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          return authService.refreshTokens().pipe(
            switchMap((newToken) => {
              const retryReq = req.clone({
                headers: req.headers
                  .set('Authorization', `Bearer ${newToken}`)
                  .set('X-Auth-Retry', '1'),
              });
              return next(retryReq);
            }),
            catchError(() => {
              authService.logout();
              inject(Router).navigate(['/welcome'], { replaceUrl: true });
              return throwError(() => err);
            }),
          );
        }

        // No hay refresh token: cerrar sesión directamente.
        authService.logout();
        inject(Router).navigate(['/welcome'], { replaceUrl: true });
      }

      return throwError(() => err);
    }),
  );
};
