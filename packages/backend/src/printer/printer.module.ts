import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrinterController } from './printer.controller';
import { PrintQueueService } from './queue/print-queue.service';
import { EscposProvider } from './providers/escpos-provider';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  providers: [PrinterService, PrintQueueService, EscposProvider, FirebaseService],
  controllers: [PrinterController],
  exports: [PrinterService],
})
export class PrinterModule {}
