import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  providers: [ProductsService, FirebaseService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
