import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { AuditLog, AuditFilter } from '@claudepp/shared';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private firebaseService: FirebaseService) {}

  async log(storeId: string, log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const id = uuid();
    const auditLog: AuditLog = {
      ...log,
      id,
      createdAt: new Date(),
    };

    await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('audit-logs')
      .doc(id)
      .set(auditLog);

    this.logger.log(`Audit log created: ${id}`);
    return auditLog;
  }

  async getLogs(storeId: string, filter?: AuditFilter): Promise<AuditLog[]> {
    let ref: any = this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('audit-logs');

    if (filter) {
      if (filter.userId) ref = ref.where('userId', '==', filter.userId);
      if (filter.action) ref = ref.where('action', '==', filter.action);
      if (filter.resource) ref = ref.where('resource', '==', filter.resource);
      if (filter.status) ref = ref.where('status', '==', filter.status);
    }

    const snapshot = await ref.orderBy('createdAt', 'desc').limit(100).get();
    return snapshot.docs.map(doc => doc.data() as AuditLog);
  }

  async getUserActions(storeId: string, userId: string): Promise<AuditLog[]> {
    const snapshot = await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('audit-logs')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map(doc => doc.data() as AuditLog);
  }

  async getProductChanges(storeId: string, productId: string): Promise<AuditLog[]> {
    const snapshot = await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('audit-logs')
      .where('resourceId', '==', productId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map(doc => doc.data() as AuditLog);
  }
}
