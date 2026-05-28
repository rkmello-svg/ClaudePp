import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    getFirestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn((id: string) => ({
          set: jest.fn().mockResolvedValue(undefined),
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              id,
              name: 'Test Product',
              barcode: '1234567890123',
              price: 99.99,
              active: true,
            }),
          }),
          update: jest.fn().mockResolvedValue(undefined),
        })),
        where: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [
              {
                data: () => ({
                  id: 'prod-1',
                  name: 'Test Product',
                  barcode: '1234567890123',
                  price: 99.99,
                  active: true,
                }),
              },
            ],
          }),
        })),
        limit: jest.fn().mockReturnThis(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        barcode: '1234567890123',
        price: 99.99,
        cost: 50,
        stock: 100,
        category: 'Test',
      };

      const result = await service.createProduct('store-123', createProductDto);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Product');
      expect(result.barcode).toBe('1234567890123');
      expect(result.active).toBe(true);
    });
  });

  describe('getProductById', () => {
    it('should return product by id', async () => {
      const result = await service.getProductById('store-123', 'prod-1');

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Product');
    });

    it('should throw NotFoundException if product not found', async () => {
      (mockFirebaseService.getFirestore().collection().doc().get as jest.Mock).mockResolvedValueOnce(
        {
          exists: false,
        },
      );

      await expect(service.getProductById('store-123', 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProductByBarcode', () => {
    it('should return product by barcode', async () => {
      const result = await service.getProductByBarcode('store-123', '1234567890123');

      expect(result).toHaveProperty('barcode');
      expect(result.barcode).toBe('1234567890123');
    });

    it('should throw NotFoundException if barcode not found', async () => {
      (mockFirebaseService.getFirestore().collection().where().where().limit().get as jest.Mock).mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      await expect(
        service.getProductByBarcode('store-123', '9999999999999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchProducts', () => {
    it('should search products by name', async () => {
      const result = await service.searchProducts('store-123', 'Test');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      const result = await service.deleteProduct('store-123', 'prod-1');

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });
  });
});
