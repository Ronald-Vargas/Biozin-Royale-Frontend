export interface BjTable {
  id:          number;
  min:         number;
  max:         number;
  players:     number;
  max_players: number;
  secs:        number;
  tag:         string | null;
  /** Estado en vivo de la sala (waiting/starting/betting/dealing/acting/...) */
  state?:      string;
}

/** Config estática por mesa: players/secs los completa el snapshot en vivo del servidor. */
export type BjTableConfig = Omit<BjTable, 'players' | 'secs'>;

export const BJ_TABLES: BjTableConfig[] = [
  { id: 1, min: 10,  max: 1000,  max_players: 4, tag: null },
  { id: 2, min: 25,  max: 2500,  max_players: 4, tag: null },
  { id: 3, min: 50,  max: 5000,  max_players: 4, tag: 'POPULAR' },
  { id: 4, min: 100, max: 10000, max_players: 4, tag: null },
  { id: 5, min: 250, max: 25000, max_players: 4, tag: 'VIP' },
];

export const FACE_TINTS = ['#caa', '#ac9', '#9ab', '#cab', '#bca', '#acc', '#cba'];

export function fmtSecs(s: number): string {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}