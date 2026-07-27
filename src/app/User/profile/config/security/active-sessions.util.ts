import { ICON_PHONE, ICON_TABLET, ICON_DESKTOP } from 'src/app/User/shared/icons/icons';
import { SessionResultado } from 'src/app/Core/Models/profile.models';

export interface SessionRow {
  id:        string;
  device:    string;
  icon:      string;
  ip:        string;
  when:      string;
  isCurrent: boolean;
}

export function mapSession(s: SessionResultado): SessionRow {
  const label = s.deviceLabel ?? 'Dispositivo desconocido';
  const lower = label.toLowerCase();
  const icon = lower.includes('iphone') || lower.includes('android')
    ? ICON_PHONE
    : lower.includes('ipad')
      ? ICON_TABLET
      : ICON_DESKTOP;

  const fecha = new Date(s.createdAt);
  const when = `Iniciada: ${fecha.toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })} · ${fecha.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}`;

  return {
    id: s.id,
    device: label,
    icon,
    ip: s.ipAddress ?? 'IP desconocida',
    when,
    isCurrent: s.isCurrent,
  };
}
