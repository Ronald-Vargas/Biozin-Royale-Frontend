export interface CrearInternalRequestRequest {
  subject: string;
  description: string;
  targetAdminId: string;
}

export interface InternalRequestResultado {
  id: string;
  requestNumber: number;
  subject: string;
  description: string;
  status: string;
  requestedBy: string;
  requestedByName?: string | null;
  targetAdminId: string;
  targetAdminName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InternalRequestMessage {
  id: string;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

export interface EnviarInternalRequestMensajeRequest {
  body: string;
}

export interface CambiarEstadoInternalRequestRequest {
  status: string;
}

export interface NuevaSolicitudNotif {
  id: string;
  requestNumber: number;
  subject: string;
  requestedById: string;
  requestedByName?: string | null;
  createdAt: string;
}

export interface NuevoMensajeSolicitudNotif {
  solicitudId: string;
  requestNumber: number;
  subject: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}
