import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

/** Bloquea rutas que tocan dinero o datos personales a quien entró como invitado. */
export const realAccountGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentProfile()?.isGuest) {
    return router.createUrlTree(['/auth/register']);
  }

  return true;
};
