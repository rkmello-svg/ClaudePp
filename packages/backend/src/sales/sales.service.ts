import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Firestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);
  private firestore: Firestore;

  constructor(private firebaseService: FirebaseService) {
    this.firestore = firebaseService.getFirestore();
  }

  async createSale(storeId: string, cashierId: string, createSaleDto: CreateSaleDto) {
    try {
      const saleId = uuidv4();
      const now = new Date();

      // Calculate totals
      const subtotal = createSaleDto.items.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0,
      );

      const discountPercent = createSaleDto.discountPercent || 0;
      const discount = subtotal * (discountPercent / 100);
      const tax = (subtotal - discount) * 0.1; // 10% tax rate (configurable)
      const total = subtotal - discount + tax;

      const sale = {
        id: saleId,
        storeId,
        cashierId,
        items: createSaleDto.items.map((item, index) => ({
          id: uuidv4(),
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          subtotal: item.unitPrice * item.quantity,
        })),
        subtotal,
        discount,
        tax,
        total,
        payment: createSaleDto.payment,
        status: createSaleDto.status || 'completed',
        createdAt: now,
        updatedAt: now,
      };

      await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'sales'))
        .doc(saleId)
        .set(sale);

      this.logger.log(`Sale created: ${saleId}`);
      return sale;
    } catch (error) {
      this.logger.error('Error creating sale', error);
      throw error;
    }
  }

  async getSaleById(storeId: string, saleId: string) {
    try {
      const doc = await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'sales'))
        .doc(saleId)
        .get();

      if (!doc.exists) {
        throw new NotFoundException(`Sale ${saleId} not found`);
      }

      return doc.data();
    } catch (error) {
      this.logger.error(`Error fetching sale ${saleId}`, error);
      throw error;
    }
  }

  async listSales(
    storeId: string,
    page = 1,
    limit = 20,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      const salesCollection = this.firestore.collection(
        this.firebaseService.getCollectionPath(storeId, 'sales')
      );

      // Build base query with filters
      let query = salesCollection.orderBy('createdAt', 'desc');

      if (status) {
        query = query.where('status', '==', status) as any;
      }

      if (startDate) {
        query = query.where('createdAt', '>=', startDate) as any;
      }

      if (endDate) {
        query = query.where('createdAt', '<=', endDate) as any;
      }

      // Get total count of filtered results
      const countSnapshot = await query.get();
      const total = countSnapshot.docs.length;

      // Calculate pagination offset
      const offset = (page - 1) * limit;

      // Apply offset and limit for the current page
      const snapshot = await query.offset(offset).limit(limit).get();

      const sales = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        data: sales,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error listing sales', error);
      throw error;
    }
  }

  async updateSaleStatus(storeId: string, saleId: string, status: string) {
    try {
      if (!['draft', 'completed', 'cancelled'].includes(status)) {
        throw new BadRequestException('Invalid status');
      }

      await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'sales'))
        .doc(saleId)
        .update({
          status,
          updatedAt: new Date(),
        });

      return this.getSaleById(storeId, saleId);
    } catch (error) {
      this.logger.error(`Error updating sale ${saleId}`, error);
      throw error;
    }
  }

  async cancelSale(storeId: string, saleId: string) {
    return this.updateSaleStatus(storeId, saleId, 'cancelled');
  }

  async getSalesStats(storeId: string, startDate?: Date, endDate?: Date) {
    try {
      let query = this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'sales'))
        .where('status', '==', 'completed');

      if (startDate) {
        query = query.where('createdAt', '>=', startDate) as any;
      }

      if (endDate) {
        query = query.where('createdAt', '<=', endDate) as any;
      }

      const snapshot = await query.get();
      const sales = snapshot.docs.map((doc: any) => doc.data());

      const totalSales = sales.length;
      const totalAmount = sales.reduce((acc: number, sale: any) => acc + sale.total, 0);
      const totalItems = sales.reduce((acc: number, sale: any) => acc + sale.items.length, 0);
      const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0;

      return {
        totalSales,
        totalAmount,
        totalItems,
        averageTicket,
      };
    } catch (error) {
      this.logger.error('Error getting sales stats', error);
      throw error;
    }
  }

  setupRealtimeListener(storeId: string, callback: (sales: any[]) => void) {
    const unsubscribe = this.firestore
      .collection(this.firebaseService.getCollectionPath(storeId, 'sales'))
      .onSnapshot((snapshot: any) => {
        const sales = snapshot.docs.map((doc: any) => doc.data());
        callback(sales);
        this.logger.log(`Real-time sales update: ${sales.length} sales`);
      });

    return unsubscribe;
  }
}
