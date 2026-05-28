import { Injectable, Logger } from '@nestjs/common';
import {
  ITefProvider,
  CardPaymentRequest,
  PixPaymentRequest,
  PaymentRequest,
  PaymentResponse,
  TefProviderConfig,
} from '../interfaces/tef-provider.interface';

@Injectable()
export class EloProvider implements ITefProvider {
  name = 'elo';
  enabled = false;
  private readonly logger = new Logger(EloProvider.name);
  private config: TefProviderConfig;

  constructor(config?: TefProviderConfig) {
    this.config = config || {};
    this.logger.log('Elo TEF provider initialized (stub)');
  }

  async processCardPayment(request: CardPaymentRequest): Promise<PaymentResponse> {
    this.logger.log(`Processing card payment: ${request.orderId}`);
    // TODO: Implement Elo SDK integration
    return {
      transactionId: `ELO_${Date.now()}`,
      authCode: '654321',
      status: 'approved',
      amount: request.amount,
      timestamp: new Date(),
    };
  }

  async processPixPayment(request: PixPaymentRequest): Promise<PaymentResponse> {
    this.logger.log(`Processing PIX payment: ${request.orderId}`);
    // TODO: Implement Elo SDK integration
    return {
      transactionId: `ELO_PIX_${Date.now()}`,
      status: 'pending',
      amount: request.amount,
      timestamp: new Date(),
    };
  }

  async processCashPayment(request: PaymentRequest): Promise<PaymentResponse> {
    this.logger.log(`Processing cash payment: ${request.orderId}`);
    return {
      transactionId: `ELO_CASH_${Date.now()}`,
      authCode: 'CASH',
      status: 'approved',
      amount: request.amount,
      timestamp: new Date(),
    };
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentResponse> {
    this.logger.log(`Getting transaction status: ${transactionId}`);
    // TODO: Implement Elo SDK integration
    return {
      transactionId,
      status: 'approved',
      amount: 0,
      timestamp: new Date(),
    };
  }

  async refund(transactionId: string, amount: number): Promise<PaymentResponse> {
    this.logger.log(`Processing refund: ${transactionId}, amount: ${amount}`);
    // TODO: Implement Elo SDK integration
    return {
      transactionId: `ELO_REFUND_${Date.now()}`,
      status: 'approved',
      amount,
      timestamp: new Date(),
    };
  }

  async testConnection(): Promise<boolean> {
    this.logger.log('Testing Elo connection');
    // TODO: Implement actual connection test
    return true;
  }
}
