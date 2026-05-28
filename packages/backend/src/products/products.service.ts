import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Firestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private firestore: Firestore;

  constructor(private firebaseService: FirebaseService) {
    this.firestore = firebaseService.getFirestore();
  }

  async createProduct(storeId: string, createProductDto: CreateProductDto) {
    try {
      const productId = uuidv4();
      const now = new Date();

      const product = {
        id: productId,
        storeId,
        name: createProductDto.name,
        description: createProductDto.description || '',
        barcode: createProductDto.barcode,
        price: createProductDto.price,
        cost: createProductDto.cost || 0,
        stock: createProductDto.stock || 0,
        category: createProductDto.category || 'Uncategorized',
        active: true,
        createdAt: now,
        updatedAt: now,
      };

      await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'products'))
        .doc(productId)
        .set(product);

      this.logger.log(`Product created: ${productId}`);
      return product;
    } catch (error) {
      this.logger.error('Error creating product', error);
      throw error;
    }
  }

  async getProductById(storeId: string, productId: string) {
    try {
      const doc = await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'products'))
        .doc(productId)
        .get();

      if (!doc.exists) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      return doc.data();
    } catch (error) {
      this.logger.error(`Error fetching product ${productId}`, error);
      throw error;
    }
  }

  async getProductByBarcode(storeId: string, barcode: string) {
    try {
      const snapshot = await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'products'))
        .where('barcode', '==', barcode)
        .where('active', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        throw new NotFoundException(`Product with barcode ${barcode} not found`);
      }

      return snapshot.docs[0].data();
    } catch (error) {
      this.logger.error(`Error fetching product by barcode ${barcode}`, error);
      throw error;
    }
  }

  async searchProducts(storeId: string, query: string, category?: string, limit = 20) {
    try {
      let q = this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'products'))
        .where('active', '==', true);

      if (category) {
        q = q.where('category', '==', category);
      }

      const snapshot = await q.limit(limit).get();

      // Simple in-memory filtering for search
      const products = snapshot.docs
        .map((doc: any) => doc.data())
        .filter(
          (product: any) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.barcode.includes(query),
        );

      return products;
    } catch (error) {
      this.logger.error(`Error searching products`, error);
      throw error;
    }
  }

  async listProducts(storeId: string, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const snapshot = await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'products'))
        .where('active', '==', true)
        .limit(limit + offset)
        .get();

      const products = snapshot.docs.map((doc: any) => doc.data()).slice(offset);
      const total = snapshot.docs.length;

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error listing products', error);
      throw error;
    }
  }

  async updateProduct(storeId: string, productId: string, updateData: any) {
    try {
      await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'products'))
        .doc(productId)
        .update({
          ...updateData,
          updatedAt: new Date(),
        });

      return this.getProductById(storeId, productId);
    } catch (error) {
      this.logger.error(`Error updating product ${productId}`, error);
      throw error;
    }
  }

  async deleteProduct(storeId: string, productId: string) {
    try {
      // Soft delete - just mark as inactive
      await this.firestore
        .collection(this.firebaseService.getCollectionPath(storeId, 'products'))
        .doc(productId)
        .update({
          active: false,
          updatedAt: new Date(),
        });

      this.logger.log(`Product deleted (soft): ${productId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting product ${productId}`, error);
      throw error;
    }
  }
}
