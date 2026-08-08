export interface PerfilResultado {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  birthdate: string | null;
  status: string;
  role: 'user' | 'admin' | 'soporte';
  isGuest: boolean;
  hasPassword: boolean;
  hasPin: boolean;
  pinEnabled: boolean;
  twoFactorEnabled: boolean;
  token: string | null;
  refreshToken?: string | null;
  camposPendientes: string[];
  tempPassword?: string | null;
  mustChangePassword?: boolean;
  mustVerifyEmail?: boolean;
  createdAt?: string | null;
  createdByName?: string | null;
}

export interface SessionResultado {
  id: string;
  deviceLabel: string | null;
  ipAddress: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export interface SecurityEventResultado {
  eventType: string;
  createdAt: string;
}

export interface EstadisticasResultado {
  partidasJugadas: number;
  partidasGanadas: number;
  apostadoTotal: number;
  gananciasNetas: number;
}

export interface ActualizarPerfilRequest {
  username?: string;
  displayName?: string;
  phone?: string;
  country?: string;
  birthdate?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  status: string;
  role: string;
  createdAt: string;
}

export interface UserBlockInfo {
  id: string;
  reason: string;
  message: string;
  blockedAt: string;
  blockedByName: string;
}

export interface BlockUserRequest {
  reason: string;
  message: string;
}
