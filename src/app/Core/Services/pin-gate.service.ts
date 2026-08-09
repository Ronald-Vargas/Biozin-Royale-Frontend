import { Injectable, signal } from '@angular/core';

/** Coordina el pop up de PIN de transacciones entre el guard de ruta y el modal montado en AppComponent. */
@Injectable({ providedIn: 'root' })
export class PinGateService {
  readonly visible = signal(false);

  private resolver: ((confirmed: boolean) => void) | null = null;

  requestPin(): Promise<boolean> {
    this.visible.set(true);
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  resolve(confirmed: boolean): void {
    this.visible.set(false);
    this.resolver?.(confirmed);
    this.resolver = null;
  }
}
