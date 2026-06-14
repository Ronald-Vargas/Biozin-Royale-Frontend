export interface Card { r: string; s: string; }

export const SUIT_GLYPH: Record<string, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
export const SUIT_RED:   Record<string, boolean> = { H: true, D: true };

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['S', 'H', 'D', 'C'];

// Valor base para blackjack (el as se maneja aparte como 11/1)
export function cardBaseValue(r: string): number {
  if (r === 'A') return 11;
  if (r === 'J' || r === 'Q' || r === 'K') return 10;
  return parseInt(r, 10);
}

// Mejor total de la mano considerando ases; devuelve {total, soft}
export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0, aces = 0;
  for (const c of cards) {
    if (c.r === 'A') { aces++; total += 11; }
    else total += cardBaseValue(c.r);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  const soft = aces > 0 && total <= 21;
  return { total, soft };
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21;
}

// Zapato barajado (n mazos)
export function makeShoe(n = 6): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < n; d++) {
    for (const s of SUITS) {
      for (const r of RANKS) shoe.push({ r, s });
    }
  }
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}