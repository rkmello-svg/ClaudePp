import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('ProductsService Integration', () => {
  let service: ProductsService;
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    getFirestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn().mockResolvedValue(undefined),
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              id: 'product-123',
              name: 'Test Product',
              barcode: '1234567890123',
              price: 10.0,
              stock: 100,
            }),
          }),
          update: jest.fn().mockResolvedValue(undefined),
        })),
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                empty: false,
                docs: [{ data: () => ({ id: 'product-123', barcode: '1234567890123' }) }],
              }),
            })),
            get: jest.fn().mockResolvedValue({
              docs: [{ data: () => ({ id: 'product-123', name: 'Test Product' }) }],
            }),
          })),
          limit: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({
              docs: [{ data: () => ({ id: 'product-123' }) }],
            }),
          })),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => ({ id: 'product-123' }) }],
          }),
        })),
      })),
    })),
    getCollectionPath: jest.fn((storeId, collection) => `stores/${storeId}/${collection}`),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        name: 'Test Product',
        barcode: '1234567890123',
        price: 10.0,
        category: 'Electronics',
      };

      const result = await service.createProduct('store-123', createProductDto);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createProductDto.name);
    });
  });

  describe('getProductByBarcode', () => {
    it('should find product by barcode', async () => {
      const result = await service.getProductByBarcode('store-123', '1234567890123');

      expect(result).toHaveProperty('id');
      expect(result.barcode).toBe('1234567890123');
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      const result = await service.searchProducts('store-123', 'Test', 'Electronics');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('listProducts', () => {
    it('should list products with pagination', async () => {
      const result = await service.listProducts('store-123', 1, 20);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      const result = await service.deleteProduct('store-123', 'product-123');

      expect(result.success).toBe(true);
    });
  });
});
