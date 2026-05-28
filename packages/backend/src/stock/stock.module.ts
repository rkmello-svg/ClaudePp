import { Module } from '@nestjs/common';
import { StockService } from './services/stock.service';
import { StockController } from './stock.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  providers: [StockService, FirebaseService],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}
