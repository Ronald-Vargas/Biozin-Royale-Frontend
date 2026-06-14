export const BOT_NAMES   = ['Jugador 1', 'Jugador 2', 'Jugador 3'];
export const BOT_TINTS   = ['#b9a', '#ac9', '#9ab'];
export const BOT_AVATARS = ['assets/bj-av1.png', 'assets/bj-av2.png', 'assets/bj-av3.png'];

// Apuesta de bot redondeada a una ficha apilable
export function botBet(min: number, max: number): number {
  const steps = [10, 25, 50, 100, 250, 500];
  const pick  = steps.filter(s => s >= min && s <= max);
  const base  = pick.length ? pick[Math.floor(Math.random() * pick.length)] : min;
  return Math.min(max, base);
}