import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  providers: [ReportsService, FirebaseService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
