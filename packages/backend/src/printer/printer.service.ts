import { Injectable, Logger } from '@nestjs/common';
import { PrintQueueService } from './queue/print-queue.service';
import { EscposProvider } from './providers/escpos-provider';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);

  constructor(
    private printQueueService: PrintQueueService,
    private escposProvider: EscposProvider,
    private firebaseService: FirebaseService,
  ) {}

  async printReceipt(storeId: string, saleId: string, content: string): Promise<any> {
    this.logger.log(`Printing receipt for sale: ${saleId}`);
    return this.printQueueService.addPrintJob(storeId, 'receipt', content);
  }

  async testPrint(storeId: string): Promise<boolean> {
    this.logger.log(`Test print for store: ${storeId}`);
    return this.escposProvider.testPrint();
  }

  async getPrinterStatus(storeId: string): Promise<any> {
    return this.escposProvider.getStatus();
  }
}
