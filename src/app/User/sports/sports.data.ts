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

export const SPORT_MATCHES: SportMatch[] = [
  { id: 1, league: 'Premier League',  sport: 'football',   time: 'HOY 20:45', team1: 'Man United',  team2: 'Liverpool',  odds: { home: 2.80, draw: 3.20, away: 2.45 } },
  { id: 2, league: 'La Liga',         sport: 'football',   time: 'HOY 21:00', team1: 'Real Madrid', team2: 'Barcelona',  odds: { home: 2.10, draw: 3.50, away: 3.20 } },
  { id: 3, league: 'Serie A',         sport: 'football',   time: 'MÑN 19:45', team1: 'Juventus',    team2: 'Inter',      odds: { home: 2.40, draw: 3.10, away: 2.80 } },
  { id: 4, league: 'NBA',             sport: 'basketball', time: 'HOY 01:30', team1: 'Lakers',       team2: 'Celtics',    odds: { home: 1.90, draw: null,  away: 1.85 } },
  { id: 5, league: 'Ligue 1',         sport: 'football',   time: 'MÑN 20:00', team1: 'PSG',          team2: 'Marseille',  odds: { home: 1.65, draw: 3.80, away: 4.50 } },
  { id: 6, league: 'Bundesliga',      sport: 'football',   time: 'MÑN 18:30', team1: 'Bayern',       team2: 'Dortmund',   odds: { home: 1.80, draw: 3.60, away: 3.90 } },
  { id: 7, league: 'ATP Masters',     sport: 'tennis',     time: 'HOY 17:00', team1: 'Djokovic',     team2: 'Alcaraz',    odds: { home: 1.75, draw: null,  away: 2.10 } },
  { id: 8, league: 'UEFA Champions',  sport: 'football',   time: 'MÑN 21:00', team1: 'Milan',        team2: 'Arsenal',    odds: { home: 2.50, draw: 3.25, away: 2.60 } },
];
