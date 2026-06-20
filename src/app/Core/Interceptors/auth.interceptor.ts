import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
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

  return next(req);
};