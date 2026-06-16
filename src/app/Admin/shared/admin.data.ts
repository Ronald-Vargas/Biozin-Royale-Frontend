import { ICON_PEOPLE, ICON_WALLET_FILLED, ICON_TRENDING, ICON_STATS, ICON_HOME_OUTLINE, ICON_HOME_FILLED, ICON_PERSON_OUTLINE, ICON_PERSON_FILLED, ICON_WALLET_OUTLINE, ICON_DOC, ICON_SETTINGS } from "src/app/User/shared/icons/icons";

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
  { key: 'finanzas', label: 'Finanzas', route: '/admin/finanzas', icon: ICON_WALLET_OUTLINE, iconActive: ICON_WALLET_FILLED },
  { key: 'reportes', label: 'Reportes', route: '/admin/reportes', icon: ICON_DOC,            iconActive: ICON_DOC },
  { key: 'ajustes',  label: 'Ajustes',  route: '/admin/ajustes',  icon: ICON_SETTINGS,       iconActive: ICON_SETTINGS },
];