import { Module } from '@nestjs/common';
import { BarcodeService } from './barcode.service';
import { BarcodeController } from './barcode.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  providers: [BarcodeService, FirebaseService],
  controllers: [BarcodeController],
  exports: [BarcodeService],
})
export class BarcodeModule {}
