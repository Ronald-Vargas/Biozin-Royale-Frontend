


export interface AgentStat {
  name:     string;
  resolved: number;
  avg:      string;
  csat:     number;
}

export const AGENT_STATS: AgentStat[] = [
  { name: 'María G.',  resolved: 42, avg: '6 min',  csat: 96 },
  { name: 'Carlos R.', resolved: 38, avg: '7 min',  csat: 93 },
  { name: 'Sofía H.',  resolved: 31, avg: '9 min',  csat: 95 },
  { name: 'Diego F.',  resolved: 24, avg: '11 min', csat: 90 },
];
