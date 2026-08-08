export interface ApiResponse<T> {
  returnValue: T | null;
  strResponseMessage: string;
  blnError: boolean;
  strResponseTittle: string;
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

export interface TokenPar {
  token: string;
  refreshToken: string;
}
