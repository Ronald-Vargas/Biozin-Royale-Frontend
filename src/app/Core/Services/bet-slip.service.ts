import { Injectable, signal } from '@angular/core';
import { BetOutcome } from '../Models/sports.models';

/** Selecciones de apuesta compartidas entre el preview de Home y la pantalla de Apuestas. */
@Injectable({ providedIn: 'root' })
export class BetSlipService {
  private _selections = signal<Record<number, BetOutcome>>({});

  readonly selections = this._selections.asReadonly();

  get count(): number {
    return Object.keys(this._selections()).length;
  }

  isSelected(matchId: number, outcome: BetOutcome): boolean {
    return this._selections()[matchId] === outcome;
  }

  toggle(matchId: number, outcome: BetOutcome): void {
    const current = this._selections();
    if (current[matchId] === outcome) {
      const next = { ...current };
      delete next[matchId];
      this._selections.set(next);
    } else {
      this._selections.set({ ...current, [matchId]: outcome });
    }
  }

  clear(): void {
    this._selections.set({});
  }
}
