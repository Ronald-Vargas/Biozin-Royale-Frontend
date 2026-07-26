import { ICON_CASH, ICON_PERSON_CIRCLE, ICON_GIFT_OUTLINE, ICON_SHIELD_CHECK, ICON_HELP_CIRC, ICON_ARROW_UP_CIRCLE, ICON_GAME } from "src/app/User/shared/icons/icons";


export const TK_STATUS: Record<string, { color: string; bg: string; bd: string }> = {
  'Nuevo':      { color: '#62d89b', bg: 'rgba(63,174,110,0.16)',  bd: 'rgba(63,174,110,0.5)' },
  'nuevo':      { color: '#62d89b', bg: 'rgba(63,174,110,0.16)',  bd: 'rgba(63,174,110,0.5)' },
  'En proceso': { color: '#e6b450', bg: 'rgba(212,167,60,0.16)',  bd: 'rgba(212,167,60,0.5)' },
  'en_proceso': { color: '#e6b450', bg: 'rgba(212,167,60,0.16)',  bd: 'rgba(212,167,60,0.5)' },
  'Resuelto':   { color: '#9aa0ab', bg: 'rgba(150,160,175,0.14)', bd: 'rgba(150,160,175,0.45)' },
  'resuelto':   { color: '#9aa0ab', bg: 'rgba(150,160,175,0.14)', bd: 'rgba(150,160,175,0.45)' },
  'Abierto':    { color: '#62d89b', bg: 'rgba(63,174,110,0.16)',  bd: 'rgba(63,174,110,0.5)' },
};


export const CAT_ICON: Record<string, string> = {
  'Pagos':        ICON_CASH,
  'Cuenta':       ICON_PERSON_CIRCLE,
  'Bonos':        ICON_GIFT_OUTLINE,
  'Juegos':       ICON_GAME,
  'Verificación': ICON_SHIELD_CHECK,
  'Retiros':      ICON_ARROW_UP_CIRCLE,
  'Otro':         ICON_HELP_CIRC,
};

export const TINTS = ['#d7b48a', '#a9c2a0', '#a6bcd6', '#d3a9c0', '#c9c29a', '#a9cccb', '#cbb09a'];

export interface SupportKpi {
  label: string;
  value: number;
  delta: string;
  icon:  string;
  tint:  string;
  bg:    string;
}

export function statusLabel(s: string): string {
  const map: Record<string, string> = {
    nuevo: 'Nuevo', en_proceso: 'En proceso', resuelto: 'Resuelto',
  };
  return map[s] || s;
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Ahora';
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} h`;
  return 'Ayer';
}

