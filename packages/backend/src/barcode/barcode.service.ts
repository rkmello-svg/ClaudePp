import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { EAN13Validator } from './validators/ean13-validator';
import { BarcodeValidationResult, BarcodeProduct } from '@claudepp/shared';
import { v4 as uuid } from 'uuid';

@Injectable()
export class BarcodeService {
  private readonly logger = new Logger(BarcodeService.name);
  private ean13Validator = new EAN13Validator();

  constructor(private firebaseService: FirebaseService) {}

  async validateBarcode(barcode: string): Promise<BarcodeValidationResult> {
    this.logger.log(`Validating barcode: ${barcode}`);
    const result = this.ean13Validator.validate(barcode);
    
    return {
      valid: result.valid,
      format: 'EAN-13',
      value: barcode,
      error: result.error,
    };
  }

  async searchByBarcode(barcode: string, storeId: string): Promise<BarcodeProduct | null> {
    this.logger.log(`Searching for product with barcode: ${barcode}`);
    
    const productsRef = this.firebaseService.db
      .collection('stores')
      .doc(storeId)
      .collection('products');

    const snapshot = await productsRef.where('barcode', '==', barcode).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      productId: doc.id,
      barcode: data.barcode,
      name: data.name,
      price: data.price,
      stock: data.stock,
    };
  }
}
