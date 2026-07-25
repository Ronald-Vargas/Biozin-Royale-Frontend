import { ICON_CASH, ICON_PERSON_CIRCLE, ICON_GIFT_OUTLINE, ICON_SHIELD_CHECK, ICON_HELP_CIRC, ICON_TIME, ICON_ARROW_UP_CIRCLE, ICON_CHATBUBBLE, ICON_CHECK_DONE, ICON_GAME } from "src/app/User/shared/icons/icons";


export interface TicketMsg {
  who:   'user' | 'support';
  name?: string;
  text:  string;
  t:     string;
  file?: { name: string; size: string };
}

export interface SupportTicket {
  id:       string;
  name:     string;
  email:    string;
  subject:  string;
  cat:      string;
  status:   string;
  time:     string;
  assigned: string;
  msgs:     TicketMsg[];
}

export interface StatusStyle { color: string; bg: string; bd: string; }

export const TK_STATUS: Record<string, StatusStyle> = {
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

export const AGENTS = ['María G.', 'Carlos R.', 'Sofía H.', 'Diego F.', 'Sin asignar'];

export const TINTS = ['#d7b48a', '#a9c2a0', '#a6bcd6', '#d3a9c0', '#c9c29a', '#a9cccb', '#cbb09a'];

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: '#BR-45821', name: 'Juan Martínez', email: 'juan.martinez@email.com',
    subject: 'Problema con depósito', cat: 'Pagos', status: 'Nuevo',
    time: 'Hace 5 min', assigned: 'María G.',
    msgs: [
      { who: 'user', text: 'Realicé un depósito de $200.000 COP hace 30 minutos y aún no se refleja en mi cuenta.', t: '14:32' },
      { who: 'support', name: 'María G.', text: 'Hola, gracias por contactarnos. Estamos revisando tu depósito. Por favor envíanos el comprobante para verificarlo.', t: '14:35' },
      { who: 'user', text: 'Adjunto el comprobante del depósito.', t: '14:37', file: { name: 'comprobante_deposito.png', size: '1.2 MB' } },
    ],
  },
  {
    id: '#BR-45822', name: 'Ana Sofía López', email: 'ana.lopez@email.com',
    subject: 'Verificación de cuenta', cat: 'Cuenta', status: 'Nuevo',
    time: 'Hace 12 min', assigned: 'Sin asignar',
    msgs: [
      { who: 'user', text: 'Subí mi documento de identidad hace 2 días y mi cuenta sigue sin verificarse. ¿Cuánto tarda?', t: '14:25' },
    ],
  },
  {
    id: '#BR-45823', name: 'Carlos Ramírez', email: 'carlos.ramirez@email.com',
    subject: 'Bono de cumpleaños no recibido', cat: 'Bonos', status: 'Nuevo',
    time: 'Hace 18 min', assigned: 'Sin asignar',
    msgs: [
      { who: 'user', text: 'Hoy es mi cumpleaños y no me ha llegado el bono que prometen. ¿Pueden revisarlo?', t: '14:19' },
    ],
  },
  {
    id: '#BR-45810', name: 'Valentina Cruz', email: 'valentina.cruz@email.com',
    subject: 'Retiro demorado', cat: 'Retiros', status: 'En proceso',
    time: 'Hace 1 h', assigned: 'Carlos R.',
    msgs: [
      { who: 'user', text: 'Mi retiro lleva 3 días en proceso. Necesito ayuda urgente.', t: '12:10' },
      { who: 'support', name: 'Carlos R.', text: 'Estamos escalando tu caso al área de pagos. Te avisamos en breve.', t: '12:40' },
    ],
  },
  {
    id: '#BR-45808', name: 'Diego Fernández', email: 'diego.fernandez@email.com',
    subject: 'No puedo iniciar sesión', cat: 'Cuenta', status: 'En proceso',
    time: 'Hace 2 h', assigned: 'Sofía H.',
    msgs: [
      { who: 'user', text: 'Olvidé mi contraseña y el correo de recuperación no llega.', t: '11:05' },
      { who: 'support', name: 'Sofía H.', text: 'Reenviamos el correo. Revisa tu carpeta de spam, por favor.', t: '11:20' },
    ],
  },
  {
    id: '#BR-45795', name: 'Sofía Herrera', email: 'sofia.herrera@email.com',
    subject: 'Duda sobre límites de apuesta', cat: 'Juegos', status: 'Asignado',
    time: 'Hace 3 h', assigned: 'María G.',
    msgs: [
      { who: 'user', text: '¿Cuál es el límite máximo de apuesta en la ruleta VIP?', t: '10:02' },
    ],
  },
  {
    id: '#BR-45780', name: 'Ricardo Peña', email: 'ricardo.pena@email.com',
    subject: 'Comprobante de verificación', cat: 'Bonos', status: 'Asignado',
    time: 'Hace 4 h', assigned: 'Diego F.',
    msgs: [
      { who: 'user', text: 'Envío de nuevo mi comprobante de domicilio.', t: '09:15', file: { name: 'recibo_luz.pdf', size: '780 KB' } },
    ],
  },
  {
    id: '#BR-45762', name: 'María Gómez', email: 'maria.gomez@email.com',
    subject: 'Bono acreditado correctamente', cat: 'Bonos', status: 'Resuelto',
    time: 'Ayer', assigned: 'Carlos R.',
    msgs: [
      { who: 'user', text: 'No veía mi bono de bienvenida.', t: 'Ayer 18:40' },
      { who: 'support', name: 'Carlos R.', text: 'Ya quedó acreditado en tu saldo. ¡Disfrútalo!', t: 'Ayer 18:52' },
    ],
  },
  {
    id: '#BR-45751', name: 'Bryan Ruiz', email: 'bryan.ruiz@email.com',
    subject: 'Retiro completado', cat: 'Retiros', status: 'Resuelto',
    time: 'Ayer', assigned: 'Sofía H.',
    msgs: [
      { who: 'user', text: 'Mi retiro no aparecía.', t: 'Ayer 15:00' },
      { who: 'support', name: 'Sofía H.', text: 'Transferencia confirmada a tu banco. Caso cerrado.', t: 'Ayer 15:30' },
    ],
  },
];

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

export function supportKpis(): SupportKpi[] {
  const n = SUPPORT_TICKETS.filter(t => t.status === 'Nuevo').length;
  const p = SUPPORT_TICKETS.filter(t => t.status === 'En proceso').length;
  return [
    { label: 'Nuevos',        value: n,  delta: '+12%', icon: ICON_CHATBUBBLE,   tint: '#e06a6a', bg: 'rgba(224,106,106,0.16)' },
    { label: 'En proceso',    value: p,  delta: '+5%',  icon: ICON_TIME,         tint: '#6aa6e0', bg: 'rgba(90,150,220,0.16)' },
    { label: 'Resueltos hoy', value: 24, delta: '+20%', icon: ICON_CHECK_DONE,   tint: '#62d89b', bg: 'rgba(63,174,110,0.16)' },
  ];
}