import { Injectable, Inject, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PaymentTransaction, TransactionLog } from '@claudepp/shared';
import { ITefProvider } from './interfaces/tef-provider.interface';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private providers: Map<string, ITefProvider> = new Map();

  constructor(
    private firebaseService: FirebaseService,
    @Inject('STONE_PROVIDER') private stoneProvider: ITefProvider,
    @Inject('ELO_PROVIDER') private eloProvider: ITefProvider,
    @Inject('INGENICO_PROVIDER') private ingevicoProvider: ITefProvider,
  ) {
    this.providers.set('stone', stoneProvider);
    this.providers.set('elo', eloProvider);
    this.providers.set('ingenico', ingevicoProvider);
  }

  async processCardPayment(dto: ProcessPaymentDto, storeId: string): Promise<PaymentTransaction> {
    this.logger.log(`Processing card payment for sale: ${dto.saleId}`);
    
    const transactionId = uuid();
    const provider = this.providers.get('stone'); // Default to Stone
    
    if (!provider) {
      throw new Error('Payment provider not configured');
    }

    try {
      // Validate cardData is present
      if (!dto.cardData) {
        throw new Error('Card data is required for card payments');
      }

      const response = await provider.processCardPayment({
        amount: dto.amount,
        installments: dto.installments,
        orderId: dto.saleId,
        cardNumber: dto.cardData.number,
        cardHolderName: dto.cardData.holderName,
        expiryMonth: dto.cardData.expiryMonth,
        expiryYear: dto.cardData.expiryYear,
        cvv: dto.cardData.cvv,
      });

      const transaction: PaymentTransaction = {
        id: transactionId,
        storeId,
        saleId: dto.saleId,
        amount: dto.amount,
        method: 'card',
        provider: 'stone',
        status: response.status === 'approved' ? 'approved' : 'declined',
        transactionId: response.transactionId,
        authCode: response.authCode,
        installments: dto.installments,
        last4Digits: dto.cardData.number.slice(-4),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firestore
      await this.firebaseService.db
        .collection('stores')
        .doc(storeId)
        .collection('payments')
        .doc(transactionId)
        .set(transaction);

      // Log transaction
      await this.logTransaction(storeId, transaction);

      return transaction;
    } catch (error) {
      this.logger.error(
        `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async processPixPayment(dto: ProcessPaymentDto, storeId: string): Promise<PaymentTransaction> {
    this.logger.log(`Processing PIX payment for sale: ${dto.saleId}`);

    const transactionId = uuid();
    const provider = this.providers.get('stone');

    // Validate provider is configured
    if (!provider) {
      throw new Error('PIX payment provider not configured');
    }

    // Validate pixData is present
    if (!dto.pixData) {
      throw new Error('PIX data is required for PIX payments');
    }

    const response = await provider.processPixPayment({
      amount: dto.amount,
      orderId: dto.saleId,
      cpfCnpj: dto.pixData.cpfCnpj,
    });

    const transaction: PaymentTransaction = {
      id: transactionId,
      storeId,
      saleId: dto.saleId,
      amount: dto.amount,
      method: 'pix',
      provider: 'stone',
      status: 'pending',
      transactionId: response.transactionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('payments')
      .doc(transactionId)
      .set(transaction);

    await this.logTransaction(storeId, transaction);

    return transaction;
  }

  async processCashPayment(dto: ProcessPaymentDto, storeId: string): Promise<PaymentTransaction> {
    this.logger.log(`Processing cash payment for sale: ${dto.saleId}`);

    const transactionId = uuid();
    const provider = this.providers.get('stone');

    // Validate provider is configured
    if (!provider) {
      throw new Error('Cash payment provider not configured');
    }

    const response = await provider.processCashPayment({
      amount: dto.amount,
      orderId: dto.saleId,
    });

    const transaction: PaymentTransaction = {
      id: transactionId,
      storeId,
      saleId: dto.saleId,
      amount: dto.amount,
      method: 'cash',
      provider: 'stone',
      status: 'approved',
      transactionId: response.transactionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('payments')
      .doc(transactionId)
      .set(transaction);

    await this.logTransaction(storeId, transaction);

    return transaction;
  }

  async getPaymentStatus(transactionId: string, storeId: string): Promise<PaymentTransaction> {
    const doc = await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('payments')
      .doc(transactionId)
      .get();

    if (!doc.exists) {
      throw new Error('Payment not found');
    }

    return doc.data() as PaymentTransaction;
  }

  async getAvailableMethods(storeId: string): Promise<string[]> {
    // TODO: Get from integration config
    return ['card', 'pix', 'cash'];
  }

  private async logTransaction(storeId: string, transaction: PaymentTransaction): Promise<void> {
    const log: TransactionLog = {
      id: uuid(),
      storeId,
      type: 'payment',
      action: `Process ${transaction.method} payment`,
      result: transaction.status === 'approved' ? 'success' : 'failure',
      message: `Payment ${transaction.transactionId} - ${transaction.status}`,
      details: { transactionId: transaction.transactionId },
      createdAt: new Date(),
    };

    await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('audit-logs')
      .doc(log.id)
      .set(log);
  }
}
