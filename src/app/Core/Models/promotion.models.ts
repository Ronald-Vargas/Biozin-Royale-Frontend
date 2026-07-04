export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  promotionType: string;
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

export interface AdminUser {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  status: string;
  role: string;
  createdAt: string;
}
