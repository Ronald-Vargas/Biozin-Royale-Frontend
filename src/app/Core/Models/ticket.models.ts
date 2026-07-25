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
