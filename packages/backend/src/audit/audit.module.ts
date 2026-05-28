import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  providers: [AuditService, FirebaseService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
