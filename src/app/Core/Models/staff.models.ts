export interface CrearStaffMemberRequest {
  nombre: string;
  correoContacto: string;
  phone?: string;
  role: 'admin' | 'soporte';
}
