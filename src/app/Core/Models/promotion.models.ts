export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  isActive: boolean;
  endsAt: string | null;
}

export interface PromotionClaim {
  id: string;
  promotionId: string;
  promotion: Promotion | null;
  status: string;
  claimedAt: string;
}

export interface CrearPromocionRequest {
  title: string;
  description?: string;
  amount: number;
  isActive: boolean;
  endsAt?: string | null;
}

export interface OtorgarBonoRequest {
  title: string;
  description?: string;
  amount: number;
  isActive: boolean;
}

