import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Store, StoreKPIs } from '@claudepp/shared';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(private firebaseService: FirebaseService) {}

  async createStore(data: Partial<Store>): Promise<Store> {
    const id = uuid();
    const store: Store = {
      id,
      name: data.name,
      cnpj: data.cnpj,
      address: data.address,
      phone: data.phone,
      email: data.email,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.firebaseService.db.collection('stores').doc(id).set(store);
    this.logger.log(`Store created: ${id}`);
    return store;
  }

  async getStore(storeId: string): Promise<Store> {
    const doc = await this.firebaseService.db.collection('stores').doc(storeId).get();
    if (!doc.exists) {
      throw new Error('Store not found');
    }
    return doc.data() as Store;
  }

  async listStores(): Promise<Store[]> {
    const snapshot = await this.firebaseService.db.collection('stores').get();
    return snapshot.docs.map(doc => doc.data() as Store);
  }

  async updateStore(storeId: string, data: Partial<Store>): Promise<Store> {
    const store = await this.getStore(storeId);
    const updated = { ...store, ...data, updatedAt: new Date() };
    await this.firebaseService.db.collection('stores').doc(storeId).set(updated);
    this.logger.log(`Store updated: ${storeId}`);
    return updated;
  }

  async deleteStore(storeId: string): Promise<void> {
    await this.firebaseService.db.collection('stores').doc(storeId).delete();
    this.logger.log(`Store deleted: ${storeId}`);
  }

  async getStoreKPIs(storeId: string, days: number = 30): Promise<StoreKPIs> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // TODO: Calculate actual KPIs from sales, products, etc.
    return {
      storeId,
      period: { startDate, endDate },
      totalRevenue: 0,
      totalTransactions: 0,
      averageTicket: 0,
      topProduct: '',
      topCashier: '',
      stockTurnover: 0,
    };
  }
}
