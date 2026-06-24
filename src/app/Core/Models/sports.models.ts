export type Sport = 'football' | 'basketball' | 'tennis';
export type BetOutcome = 'home' | 'draw' | 'away';

export interface SportMatch {
  id: number;
  league: string;
  sport: Sport;
  time: string;
  team1: string;
  team2: string;
  odds: { home: number; draw: number | null; away: number };
}
