export interface BjTable {
  id:          number;
  min:         number;
  max:         number;
  players:     number;
  max_players: number;
  secs:        number;
  tag:         string | null;
}

export const BJ_TABLES: BjTable[] = [
  { id: 1, min: 10,  max: 1000,  players: 3, max_players: 4, secs: 45,  tag: null },
  { id: 2, min: 25,  max: 2500,  players: 2, max_players: 4, secs: 80,  tag: null },
  { id: 3, min: 50,  max: 5000,  players: 4, max_players: 4, secs: 15,  tag: 'POPULAR' },
  { id: 4, min: 100, max: 10000, players: 2, max_players: 4, secs: 150, tag: null },
  { id: 5, min: 250, max: 25000, players: 1, max_players: 4, secs: 190, tag: 'VIP' },
  { id: 6, min: 10,  max: 1000,  players: 3, max_players: 4, secs: 55,  tag: null },
];

export const FACE_TINTS = ['#caa', '#ac9', '#9ab', '#cab', '#bca', '#acc', '#cba'];

export function fmtSecs(s: number): string {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}