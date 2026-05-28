export interface TefProviderConfig {
  merchantId?: string;
  terminalId?: string;
  apiKey?: string;
  apiSecret?: string;
  environment?: 'test' | 'production';
}

export interface PaymentRequest {
  amount: number;
  installments?: number;
  orderId: string;
  description?: string;
}

export interface CardPaymentRequest extends PaymentRequest {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

export interface PixPaymentRequest extends PaymentRequest {
  cpfCnpj: string;
}

export interface PaymentResponse {
  transactionId: string;
  authCode?: string;
  status: 'approved' | 'declined' | 'pending';
  errorMessage?: string;
  amount: number;
  timestamp: Date;
}

export interface ITefProvider {
  name: string;
  enabled: boolean;

  processCardPayment(request: CardPaymentRequest): Promise<PaymentResponse>;
  processPixPayment(request: PixPaymentRequest): Promise<PaymentResponse>;
  processCashPayment(request: PaymentRequest): Promise<PaymentResponse>;
  getTransactionStatus(transactionId: string): Promise<PaymentResponse>;
  refund(transactionId: string, amount: number): Promise<PaymentResponse>;
  testConnection(): Promise<boolean>;
}
