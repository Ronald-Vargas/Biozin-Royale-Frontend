import { ICON_PEOPLE, ICON_WALLET_FILLED, ICON_TRENDING, ICON_STATS, ICON_HOME_OUTLINE, ICON_HOME_FILLED, ICON_PERSON_OUTLINE, ICON_PERSON_FILLED, ICON_WALLET_OUTLINE, ICON_DOC, ICON_SETTINGS, ICON_ARROW_DOWN, ICON_ARROW_UP, ICON_BITCOIN, ICON_CASH, ICON_SHIELD, ICON_SYNC_CIRCLE, ICON_TROPHY, ICON_GIFT_FILLED, ICON_GIFT_OUTLINE } from "src/app/User/shared/icons/icons";

export interface AdminKpi {
  label: string;
  value: string;
  delta: string;
  icon:  string;  // SVG string
}

export interface AdminNavItem {
  key:   string;
  label: string;
  route: string;
  icon:  string;        // outline
  iconActive: string;   // filled
}



export const ADMIN_KPIS: AdminKpi[] = [
  { label: 'Usuarios activos', value: '1,248',   delta: '+12% vs ayer',   icon: ICON_PEOPLE },
  { label: 'Depósitos hoy',    value: '$24,350', delta: '+8.5% vs ayer',  icon: ICON_WALLET_FILLED },
  { label: 'Retiros hoy',      value: '$12,480', delta: '+5.3% vs ayer',  icon: ICON_TRENDING },
  { label: 'Ganancia neta',    value: '$11,870', delta: '+10.2% vs ayer', icon: ICON_STATS },
];

export const ADMIN_NAV: AdminNavItem[] = [
  { key: 'home',     label: 'Inicio',   route: '/admin',          icon: ICON_HOME_OUTLINE,   iconActive: ICON_HOME_FILLED },
  { key: 'usuarios', label: 'Usuarios', route: '/admin/usuarios', icon: ICON_PERSON_OUTLINE, iconActive: ICON_PERSON_FILLED },
  { key: 'bonos',    label: 'Bonos',    route: '/admin/bonuses',    icon: ICON_GIFT_OUTLINE,   iconActive: ICON_GIFT_FILLED },
  { key: 'finanzas', label: 'Finanzas', route: '/admin/finanzas', icon: ICON_WALLET_OUTLINE, iconActive: ICON_WALLET_FILLED },
  { key: 'reportes', label: 'Reportes', route: '/admin/reportes', icon: ICON_DOC,            iconActive: ICON_DOC },
  { key: 'ajustes',  label: 'Ajustes',  route: '/admin/ajustes',  icon: ICON_SETTINGS,       iconActive: ICON_SETTINGS },
];





export interface AdminUser {
  id:     string;
  name:   string;
  role:   string;
  status: 'Activo' | 'Inactivo';
  reg:    string;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: 'USR-1001', name: 'Luis Maza',        role: 'Admin',   status: 'Activo',   reg: '12/04/2024' },
  { id: 'USR-1002', name: 'Catherine Rojas',  role: 'Soporte', status: 'Activo',   reg: '03/05/2024' },
  { id: 'USR-1003', name: 'Alejandro Bustos', role: 'Cajero',  status: 'Activo',   reg: '21/06/2024' },
  { id: 'USR-1004', name: 'Bryan Ruiz',       role: 'Cajero',  status: 'Inactivo', reg: '09/01/2024' },
  { id: 'USR-1005', name: 'María Gómez',      role: 'Soporte', status: 'Activo',   reg: '17/02/2024' },
];

export interface StatusStyle { color: string; bg: string; bd: string; }

export const STATUS_BADGE: Record<string, StatusStyle> = {
  Activo:   { color: '#62d89b', bg: 'rgba(63,174,110,0.18)',  bd: 'rgba(63,174,110,0.55)' },
  Inactivo: { color: '#ec8a8a', bg: 'rgba(224,106,106,0.16)', bd: 'rgba(224,106,106,0.5)' },
};

export interface DetailMenuItem { key: string; icon: string; title: string; sub: string; }





export interface FinSummary {
  key:    string;
  label:  string;
  icon:   string;
  amount: string;
  count:  string;
  color:  string;
  bg:     string;
  bd:     string;
}

export const FIN_SUMMARY: FinSummary[] = [
  { key: 'dep', label: 'Depósitos', icon: ICON_ARROW_DOWN, amount: '$24,350.00', count: '128 transacciones', color: '#62d89b',       bg: 'rgba(63,174,110,0.16)',  bd: 'rgba(63,174,110,0.5)' },
  { key: 'ret', label: 'Retiros',   icon: ICON_ARROW_UP,   amount: '$12,480.00', count: '76 transacciones',  color: '#ec8a8a',       bg: 'rgba(224,106,106,0.14)', bd: 'rgba(224,106,106,0.5)' },
  { key: 'bet', label: 'Apuestas',  icon: ICON_BITCOIN,    amount: '$45,920.00', count: '215 transacciones', color: 'var(--gold-1)', bg: 'rgba(212,167,60,0.14)',  bd: 'rgba(212,167,60,0.5)' },
];

export interface FinRecent {
  type:   string;
  icon:   string;
  user:   string;
  when:   string;
  amount: string;
  color:  string;
}

export const FIN_RECENT: FinRecent[] = [
  { type: 'Depósito', icon: ICON_ARROW_DOWN, user: 'USR-1001', when: 'Hoy, 09:21 AM', amount: '$250.00', color: '#62d89b' },
  { type: 'Retiro',   icon: ICON_ARROW_UP,   user: 'USR-1003', when: 'Hoy, 08:45 AM', amount: '$600.00', color: '#ec8a8a' },
  { type: 'Apuesta',  icon: ICON_BITCOIN,    user: 'USR-1002', when: 'Hoy, 07:30 AM', amount: '$150.00', color: 'var(--gold-1)' },
];











export interface RepKpi {
  label: string;
  value: string;
  sub:   string;
  icon:  string;
}

export const REP_KPIS: RepKpi[] = [
  { label: 'Usuarios',      value: '1,248',   sub: 'Activos', icon: ICON_PEOPLE },
  { label: 'Depósitos',     value: '$24,350', sub: 'Hoy',     icon: ICON_WALLET_FILLED },
  { label: 'Retiros',       value: '$12,480', sub: 'Hoy',     icon: ICON_CASH },
  { label: 'Ganancia neta', value: '$11,870', sub: 'Hoy',     icon: ICON_STATS },
];

export interface RepGen {
  key:   string;
  title: string;
  sub:   string;
}

export const REP_GEN: RepGen[] = [
  { key: 'd', title: 'Reporte diario',  sub: 'Resumen del día actual' },
  { key: 'w', title: 'Reporte semanal', sub: 'Resumen de la semana' },
  { key: 'm', title: 'Reporte mensual', sub: 'Resumen del mes' },
  { key: 'y', title: 'Reporte anual',   sub: 'Resumen del año' },
];









export interface TeamMember {
  name:       string;
  role:       string;
  status:     'Activo' | 'Inactivo';
  email:      string;
  phone?:     string;
  user?:      string;
  pass?:      string;
  access?:    string;
  sendCreds?: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Luis Maza',        role: 'Administrador', status: 'Activo',   email: 'luis.maza@biozinroyale.com' },
  { name: 'Catherine Rojas',  role: 'Soporte',       status: 'Activo',   email: 'catherine.rojas@biozinroyale.com' },
  { name: 'Alejandro Bustos', role: 'Administrador', status: 'Activo',   email: 'alejandro.bustos@biozinroyale.com' },
  { name: 'Bryan Ruiz',       role: 'Administrador', status: 'Inactivo', email: 'bryan.ruiz@biozinroyale.com' },
  { name: 'María Gómez',      role: 'Soporte',       status: 'Activo',   email: 'maria.gomez@biozinroyale.com' },
  { name: 'Diego Fernández',  role: 'Administrador', status: 'Inactivo', email: 'diego.fernandez@biozinroyale.com' },
  { name: 'Sofía Herrera',    role: 'Soporte',       status: 'Activo',   email: 'sofia.herrera@biozinroyale.com' },
  { name: 'Carlos Méndez',    role: 'Administrador', status: 'Activo',   email: 'carlos.mendez@biozinroyale.com' },
  { name: 'Valentina Cruz',   role: 'Soporte',       status: 'Activo',   email: 'valentina.cruz@biozinroyale.com' },
  { name: 'Ricardo Peña',     role: 'Soporte',       status: 'Inactivo', email: 'ricardo.pena@biozinroyale.com' },
];

export const ACCESS_BY_ROLE: Record<string, string> = {
  'Administrador': 'Acceso administrativo',
  'Soporte':       'Acceso de soporte',
};

// Genera usuario a partir del nombre (slug sin acentos)
export function autoUsername(name: string): string {
  const parts = name.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'usuario';
  if (parts.length === 1) return parts[0];
  return parts[0] + '.' + parts[parts.length - 1];
}

// Contraseña temporal aleatoria
export function autoPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const sym = '!@#$%&*';
  let p = '';
  for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p.slice(0, 4) + sym[Math.floor(Math.random() * sym.length)] + p.slice(4);
}




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




export interface AdminBono {
  id:       string;
  title:    string;
  kind:     'Liquidez' | 'Tiradas';
  icon:     string;
  desc:     string;
  req:      string;
  time:     string;
  enabled:  boolean;
  headline: string;
  sub:      string;
  terms:    string[];
  games:    string[];
}

export interface BonoKindStyle {
  color: string;
  bg:    string;
  bd:    string;
  icon:  string;
}

export const BONO_KIND: Record<string, BonoKindStyle> = {
  Liquidez: { color: '#62d89b', bg: 'rgba(63,174,110,0.16)',  bd: 'rgba(63,174,110,0.5)',  icon: ICON_CASH },
  Tiradas:  { color: '#6aa6e0', bg: 'rgba(90,150,220,0.16)',  bd: 'rgba(90,150,220,0.5)',  icon: ICON_SYNC_CIRCLE },
};

export const ADMIN_BONOS: AdminBono[] = [
  {
    id: 'bienvenida', title: 'Bono de Bienvenida', kind: 'Liquidez', icon: ICON_TROPHY,
    desc: '100% hasta $500', req: 'Requisito de apuesta: 30x', time: '7 días', enabled: true,
    headline: '100% hasta $500', sub: 'Duplica tu primer depósito',
    terms: ['Válido solo para el primer depósito de la cuenta.', 'Requisito de apuesta de 30x el monto del bono.', 'Depósito mínimo de $20 para activar el bono.'],
    games: ['Tragamonedas', 'Ruleta', 'Blackjack'],
  },
  {
    id: 'cashback', title: 'Cashback Semanal', kind: 'Liquidez', icon: ICON_SHIELD,
    desc: '10% Cashback', req: 'Sin requisitos', time: 'Semanal', enabled: true,
    headline: '10% Cashback', sub: 'Recupera parte de tus pérdidas',
    terms: ['Se calcula sobre las pérdidas netas de la semana.', 'Sin requisito de apuesta: el cashback es dinero real.', 'Se acredita automáticamente cada lunes.'],
    games: ['Todos los juegos'],
  },
  {
    id: 'giros50', title: 'Giros de la Suerte', kind: 'Tiradas', icon: ICON_SYNC_CIRCLE,
    desc: '50 Giros Gratis', req: 'Sin requisitos', time: '5 días', enabled: true,
    headline: '50 Giros Gratis', sub: 'Tiradas gratis en tus slots favoritos',
    terms: ['50 giros gratis acreditados al activar.', 'Sin requisito de apuesta sobre las ganancias.', 'Válidos durante 5 días desde la activación.'],
    games: ['Gates of Biozin', 'Wanted', 'Sugar Rush'],
  },
  {
    id: 'recarga', title: 'Bono de Recarga', kind: 'Liquidez', icon: ICON_WALLET_FILLED,
    desc: '50% hasta $200', req: 'Requisito de apuesta: 20x', time: '7 días', enabled: false,
    headline: '50% hasta $200', sub: 'Recompensa por recargar tu saldo',
    terms: ['Aplica a recargas a partir de $20.', 'Requisito de apuesta de 20x el monto del bono.'],
    games: ['Tragamonedas', 'Ruleta'],
  },
];