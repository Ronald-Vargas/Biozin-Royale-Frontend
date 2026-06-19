export interface ApiResponse<T> {
  returnValue: T | null;
  strResponseMessage: string;
  blnError: boolean;
  strResponseTittle: string;
}

export interface PerfilResultado {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  birthdate: string | null;
  status: string;
  token: string | null;
  camposPendientes: string[];
}

export interface RegistroManualRequest {
  nombre: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
}

export interface LoginManualRequest {
  email: string;
  password: string;
}
