export interface IniciarDepositoResultado {
  transactionId:  string;
  provider:       'stripe' | 'paypal';
  clientSecret?:  string;
  orderId?:       string;
  balanceBefore:  number;
  receiptNumber?: string;
}
