import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  providers: [SalesService, FirebaseService],
  controllers: [SalesController],
  exports: [SalesService],
})
export class SalesModule {}
