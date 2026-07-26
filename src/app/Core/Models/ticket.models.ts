export interface CrearTicketRequest {
  subject: string;
  category: string;
  description: string;
}

export interface TicketResultado {
  id: string;
  ticketNumber: number;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
  userDisplayName?: string | null;
  userEmail?: string | null;
  userUsername?: string | null;
}

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  body: string;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: string;
}

export interface EnviarMensajeRequest {
  body: string;
  fileUrl?: string;
  fileName?: string;
}

export interface AsignarTicketRequest {
  staffMemberId: string;
}

export interface CambiarEstadoRequest {
  status: string;
}

export interface StaffSimple {
  id: string;
  displayName: string;
  role: string;
}

export interface TicketMsg {
  who:   'user' | 'support';
  name?: string;
  text:  string;
  t:     string;
  file?: { name: string; size: string; url?: string };
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

export interface SupportKpi {
  label: string;
  value: number;
  delta: string;
  icon:  string;
  tint:  string;
  bg:    string;
}
