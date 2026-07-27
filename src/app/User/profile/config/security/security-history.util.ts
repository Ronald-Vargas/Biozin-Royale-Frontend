import { ICON_LOGIN, ICON_KEY, ICON_KEYPAD, ICON_SHIELD } from 'src/app/User/shared/icons/icons';
import { SecurityEventResultado } from 'src/app/Core/Models/profile.models';

export interface HistEntry {
  label: string;
  date:  string;
  icon:  string;
  color: string;
}

const GREEN = '#4fd190';
const RED   = '#e06a6a';

const EVENT_META: Record<string, { label: string; icon: string; color: string }> = {
  login:               { label: 'Inicio de sesión',     icon: ICON_LOGIN,   color: GREEN },
  password_change:     { label: 'Cambio de contraseña', icon: ICON_KEY,     color: 'var(--gold-1)' },
  pin_created:         { label: 'PIN creado',            icon: ICON_KEYPAD,  color: 'var(--gold-1)' },
  pin_changed:         { label: 'PIN actualizado',       icon: ICON_KEYPAD,  color: 'var(--gold-1)' },
  pin_enabled:         { label: 'PIN activado',          icon: ICON_KEYPAD,  color: GREEN },
  pin_disabled:        { label: 'PIN desactivado',       icon: ICON_KEYPAD,  color: RED },
  twofactor_enabled:   { label: 'Verificación en dos pasos activada',   icon: ICON_SHIELD, color: GREEN },
  twofactor_disabled:  { label: 'Verificación en dos pasos desactivada', icon: ICON_SHIELD, color: RED },
};

export function mapSecurityEvent(e: SecurityEventResultado): HistEntry {
  const meta = EVENT_META[e.eventType] ?? { label: e.eventType, icon: ICON_SHIELD, color: 'var(--gold-1)' };
  const fecha = new Date(e.createdAt);
  const date = `${fecha.toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })} · ${fecha.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}`;
  return { label: meta.label, date, icon: meta.icon, color: meta.color };
}
