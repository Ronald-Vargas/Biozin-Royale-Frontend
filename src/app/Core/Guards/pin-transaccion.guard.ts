import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { PinGateService } from '../Services/pin-gate.service';

/** Pide el PIN de transacciones antes de entrar a rutas de wallet, solo si el usuario lo tiene activo. */
export const pinTransaccionGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const pinGateService = inject(PinGateService);

  if (!authService.currentProfile()?.pinEnabled) {
    return true;
  }

  return pinGateService.requestPin();
};
