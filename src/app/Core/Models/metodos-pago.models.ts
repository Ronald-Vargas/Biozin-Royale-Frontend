export interface MetodoPago {
  id:          string;
  type:        'paypal' | 'card';
  alias:       string | null;
  isDefault:   boolean;
  createdAt:   string;
  // PayPal
  email?:      string | null;
  // Tarjeta
  cardHolder?: string | null;
  lastFour?:   string | null;
  network?:    'visa' | 'mastercard' | 'amex' | 'other' | null;
  expiryMonth?: number | null;
  expiryYear?:  number | null;
}

export interface AgregarPayPalRequest {
  email:     string;
  alias:     string | null;
  isDefault: boolean;
}

export interface AgregarTarjetaRequest {
  cardNumber:  string;
  cardHolder:  string;
  expiryMonth: number;
  expiryYear:  number;
  alias:       string | null;
  isDefault:   boolean;
}

export interface IniciarRetiroRequest {
  paymentMethodId: string;
  amount:          number;
}

export interface RetiroResultado {
  transactionId: string;
  newBalance:    number;
}
