export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export interface PromotionClaim {
  id: string;
  promotionId: string;
  promotion: Promotion | null;
  status: string;
  claimedAt: string;
  completedAt: string | null;
}

export interface CrearPromocionRequest {
  title: string;
  description?: string;
  amount: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface OtorgarBonoRequest {
  title: string;
  description?: string;
  amount: number;
  isActive: boolean;
}

