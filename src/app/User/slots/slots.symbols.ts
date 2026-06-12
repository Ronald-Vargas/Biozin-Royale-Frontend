// Colores [light, mid, dark] por símbolo
export const SYM_COLORS: Record<string, [string, string, string]> = {
  purple: ['#dca8ff', '#8a3fe0', '#43137f'],
  blue:   ['#a6daff', '#2f8de0', '#143f7a'],
  green:  ['#a6ffc6', '#2fbf6f', '#0f5a30'],
  red:    ['#ffa79c', '#e0473a', '#8a1d15'],
  yellow: ['#fff3b0', '#f3d24e', '#a87e22'],
  orange: ['#ffce99', '#f3923a', '#a8541f'],
  gold:   ['#fff2c4', '#e9c969', '#8a6a1e'],
};

// Geometría por forma
export interface Shape {
  outer: string;
  table: string;
  lines: number[][];  // [x1,y1,x2,y2]
  hi:    string;
}

export const SHAPES: Record<string, Shape> = {
  hex: {
    outer: '32,10 68,10 92,50 68,90 32,90 8,50',
    table: '40,27 60,27 77,50 60,73 40,73 23,50',
    lines: [[32,10,40,27],[68,10,60,27],[92,50,77,50],[68,90,60,73],[32,90,40,73],[8,50,23,50]],
    hi:    '44,31 56,31 50,42',
  },
  kite: {
    outer: '50,6 88,42 50,94 12,42',
    table: '50,24 70,42 50,53 30,42',
    lines: [[12,42,88,42],[50,24,12,42],[50,24,88,42],[30,42,50,94],[70,42,50,94],[50,53,50,94]],
    hi:    '50,27 62,40 50,46',
  },
  emerald: {
    outer: '27,15 73,15 85,30 85,70 73,85 27,85 15,70 15,30',
    table: '35,30 65,30 65,70 35,70',
    lines: [[15,30,35,30],[85,30,65,30],[15,70,35,70],[85,70,65,70],[27,15,35,30],[73,15,65,30],[27,85,35,70],[73,85,65,70]],
    hi:    '39,34 52,34 46,46',
  },
  pear: {
    outer: '50,7 64,19 73,40 68,66 50,93 32,66 27,40 36,19',
    table: '50,24 61,38 56,60 50,71 44,60 39,38',
    lines: [[50,7,50,24],[50,71,50,93],[39,38,27,40],[61,38,73,40]],
    hi:    '48,28 58,40 50,48',
  },
  round: {
    outer: '38,15 62,15 85,38 85,62 62,85 38,85 15,62 15,38',
    table: '43,28 57,28 72,43 72,57 57,72 43,72 28,57 28,43',
    lines: [[38,15,43,28],[62,15,57,28],[85,38,72,43],[85,62,72,57],[62,85,57,72],[38,85,43,72],[15,62,28,57],[15,38,28,43]],
    hi:    '47,32 58,32 52,44',
  },
  marquise: {
    outer: '50,6 66,28 74,50 66,72 50,94 34,72 26,50 34,28',
    table: '50,24 60,40 56,56 50,74 44,56 40,40',
    lines: [[50,6,50,24],[50,74,50,94],[26,50,40,48],[74,50,60,48]],
    hi:    '48,28 58,42 50,50',
  },
};

export const GEM_SHAPE: Record<string, string> = {
  purple:   'hex',
  blue:     'kite',
  green:    'emerald',
  red:      'pear',
  yellow:   'round',
  orange:   'marquise',
};

// Multiplicador + peso de aparición
export interface Symbol { mult: number; weight: number; }

export const SYMBOLS: Record<string, Symbol> = {
  ring:   { mult: 2.5,  weight: 4 },
  crown:  { mult: 1.5,  weight: 6 },
  red:    { mult: 0.8,  weight: 11 },
  purple: { mult: 0.6,  weight: 13 },
  blue:   { mult: 0.5,  weight: 14 },
  green:  { mult: 0.4,  weight: 16 },
  orange: { mult: 0.35, weight: 17 },
  yellow: { mult: 0.3,  weight: 19 },
};

export const SYM_NAMES: Record<string, string> = {
  ring:   'Anillo',
  crown:  'Corona',
  red:    'Rubí',
  purple: 'Amatista',
  blue:   'Zafiro',
  green:  'Esmeralda',
  orange: 'Topacio',
  yellow: 'Citrino',
};

export const PAY_ORDER = ['ring', 'crown', 'red', 'purple', 'blue', 'green', 'orange', 'yellow'];

// Pool ponderado para random
const WEIGHTED_POOL: string[] = (() => {
  const pool: string[] = [];
  for (const [k, v] of Object.entries(SYMBOLS)) {
    for (let i = 0; i < v.weight; i++) pool.push(k);
  }
  return pool;
})();

export function randomSym(): string {
  return WEIGHTED_POOL[Math.floor(Math.random() * WEIGHTED_POOL.length)];
}

export function glowColor(sym: string): string {
  const key = (sym === 'crown' || sym === 'ring') ? 'gold' : sym;
  return (SYM_COLORS[key] || ['', '#c79a32', ''])[1];
}

// Líneas de pago (10 líneas, 4 columnas)
export const LINES: number[][] = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [2, 2, 2, 2],
  [3, 3, 3, 3],
  [0, 1, 2, 3],
  [3, 2, 1, 0],
  [0, 1, 1, 0],
  [3, 2, 2, 3],
  [1, 2, 2, 1],
  [2, 1, 1, 2],
];

export const LEN_FACTOR: Record<number, number> = { 3: 4, 4: 28 };
export const COLS = 4;
export const ROWS = 4;