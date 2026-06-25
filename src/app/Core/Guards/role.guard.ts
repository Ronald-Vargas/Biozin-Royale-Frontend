import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

/** Permite la ruta solo si hay sesión y el rol del perfil está en `roles`. */
export function roleGuard(roles: Array<'admin' | 'soporte' | 'user'>): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/welcome']);
    }

    const perfil = authService.currentProfile();
    if (!perfil || !roles.includes(perfil.role)) {
      return router.createUrlTree(['/home']);
    }

    return true;
  };
}
