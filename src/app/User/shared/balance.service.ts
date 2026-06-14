import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private _balance = signal(1250.00);

  readonly balance = this._balance.asReadonly();

  deduct(amount: number): boolean {
    if (amount > this._balance()) return false;
    this._balance.update(b => +(b - amount).toFixed(2));
    return true;
  }

  add(amount: number): void {
    this._balance.update(b => +(b + amount).toFixed(2));
  }
}
