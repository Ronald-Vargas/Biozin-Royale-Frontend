export interface ActualizarStaffMemberRequest {
  displayName?: string;
  phone?: string;
}

export interface CrearStaffMemberRequest {
  nombre: string;
  correoContacto: string;
  phone?: string;
  role: 'admin' | 'soporte';
}

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

