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
  token: string | null;
  camposPendientes: string[];
  tempPassword?: string | null;
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
