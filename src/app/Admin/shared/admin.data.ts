import { ICON_PEOPLE, ICON_WALLET_FILLED, ICON_TRENDING, ICON_STATS, ICON_HOME_OUTLINE, ICON_HOME_FILLED, ICON_PERSON_OUTLINE, ICON_PERSON_FILLED, ICON_WALLET_OUTLINE, ICON_DOC, ICON_SETTINGS, ICON_ARROW_DOWN, ICON_ARROW_UP, ICON_BITCOIN, ICON_CASH, ICON_GIFT_FILLED, ICON_GIFT_OUTLINE } from "src/app/User/shared/icons/icons";

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
  { key: 'bonos',    label: 'Bonos',    route: '/admin/bonuses',    icon: ICON_GIFT_OUTLINE, iconActive: ICON_GIFT_FILLED },
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
  { id: 'USR-1003', name: 'Alejandro Bustos', role: 'Admin',  status: 'Activo',   reg: '21/06/2024' },
  { id: 'USR-1004', name: 'Bryan Ruiz',       role: 'Soporte',  status: 'Inactivo', reg: '09/01/2024' },
  { id: 'USR-1005', name: 'María Gómez',      role: 'Soporte', status: 'Activo',   reg: '17/02/2024' },
];

export interface StatusStyle { color: string; bg: string; bd: string; }

export const STATUS_BADGE: Record<string, StatusStyle> = {
  Activo:    { color: '#62d89b', bg: 'rgba(63,174,110,0.18)',   bd: 'rgba(63,174,110,0.55)' },
  Inactivo:  { color: '#ec8a8a', bg: 'rgba(224,106,106,0.16)',  bd: 'rgba(224,106,106,0.5)' },
  Bloqueado: { color: '#e98a85', bg: 'rgba(199, 62, 58, 0.18)', bd: 'rgba(214, 77, 72, 0.6)' },
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




