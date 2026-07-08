export interface WalletTransactionResultado {
  id: string;
  transactionType: string;
  status: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  createdAt: string;
}

export function isDeposit(t: WalletTransactionResultado): boolean {
  return t.transactionType === 'deposit';
}

export function transactionTypeLabel(t: WalletTransactionResultado): string {
  return isDeposit(t) ? 'Depósito' : 'Retiro';
}

export function transactionColor(t: WalletTransactionResultado): string {
  return isDeposit(t) ? '#4fd190' : '#e06a6a';
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completado',
  pending: 'En proceso',
  failed: 'Fallido',
};

export function transactionStatusLabel(t: WalletTransactionResultado): string {
  return STATUS_LABELS[t.status] ?? t.status;
}

export function transactionStatusColor(t: WalletTransactionResultado): string {
  if (t.status === 'pending') return '#e7c86b';
  if (t.status === 'failed') return '#e06a6a';
  return '#4fd190';
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatTransactionDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`;
}

export function formatTransactionAmount(t: WalletTransactionResultado): string {
  return `${isDeposit(t) ? '+' : '-'} $${Math.abs(t.amount).toFixed(2)}`;
}
