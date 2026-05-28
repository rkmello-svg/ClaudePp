import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  providers: [StoresService, FirebaseService],
  controllers: [StoresController],
  exports: [StoresService],
})
export class StoresModule {}
