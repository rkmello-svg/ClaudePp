import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { StockMovement, StockAlert } from '@claudepp/shared';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(private firebaseService: FirebaseService) {}

  async getStock(storeId: string, productId?: string): Promise<any[]> {
    const ref = this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('stock');

    let query: any = ref;
    if (productId) {
      query = query.where('productId', '==', productId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data());
  }

  async adjustStock(storeId: string, productId: string, quantity: number, reason: string, userId: string): Promise<StockMovement> {
    const movementId = uuid();
    const movement: StockMovement = {
      id: movementId,
      storeId,
      productId,
      quantity,
      type: 'adjustment',
      reason,
      userId,
      createdAt: new Date(),
    };

    await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('stock')
      .collection('movements')
      .doc(movementId)
      .set(movement);

    this.logger.log(`Stock adjusted: ${productId} by ${quantity}`);
    return movement;
  }

  async getMovements(storeId: string): Promise<StockMovement[]> {
    const snapshot = await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('stock')
      .collection('movements')
      .get();

    return snapshot.docs.map(doc => doc.data() as StockMovement);
  }

  async getAlerts(storeId: string): Promise<StockAlert[]> {
    const snapshot = await this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('stock')
      .collection('alerts')
      .where('triggered', '==', true)
      .get();

    return snapshot.docs.map(doc => doc.data() as StockAlert);
  }
}
