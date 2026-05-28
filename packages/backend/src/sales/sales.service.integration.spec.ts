import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('SalesService Integration', () => {
  let service: SalesService;

  const mockFirebaseService = {
    getFirestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn().mockResolvedValue(undefined),
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              id: 'sale-123',
              items: [{ productId: 'product-1', quantity: 1 }],
              total: 100,
              status: 'completed',
            }),
          }),
          update: jest.fn().mockResolvedValue(undefined),
        })),
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({
              docs: [{ data: () => ({ id: 'sale-123', total: 100 }) }],
            }),
          })),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => ({ id: 'sale-123' }) }],
          }),
          orderBy: jest.fn(() => ({
            where: jest.fn(() => ({
              where: jest.fn(() => ({
                limit: jest.fn(() => ({
                  get: jest.fn().mockResolvedValue({
                    docs: [{ data: () => ({ id: 'sale-123' }) }],
                  }),
                })),
                get: jest.fn().mockResolvedValue({
                  docs: [{ data: () => ({ id: 'sale-123' }) }],
                }),
              })),
              limit: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({
                  docs: [{ data: () => ({ id: 'sale-123' }) }],
                }),
              })),
              get: jest.fn().mockResolvedValue({
                docs: [{ data: () => ({ id: 'sale-123' }) }],
              }),
            })),
            limit: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                docs: [{ data: () => ({ id: 'sale-123' }) }],
              }),
            })),
            get: jest.fn().mockResolvedValue({
              docs: [{ data: () => ({ id: 'sale-123' }) }],
            }),
          }),
        })),
        orderBy: jest.fn(() => ({
          where: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({
                  docs: [{ data: () => ({ id: 'sale-123' }) }],
                }),
              })),
              get: jest.fn().mockResolvedValue({
                docs: [{ data: () => ({ id: 'sale-123' }) }],
              }),
            })),
            limit: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                docs: [{ data: () => ({ id: 'sale-123' }) }],
              }),
            })),
            get: jest.fn().mockResolvedValue({
              docs: [{ data: () => ({ id: 'sale-123' }) }],
            }),
          })),
          limit: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({
              docs: [{ data: () => ({ id: 'sale-123' }) }],
            }),
          })),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => ({ id: 'sale-123' }) }],
          }),
        })),
        onSnapshot: jest.fn((callback) => {
          callback({
            docs: [{ data: () => ({ id: 'sale-123' }) }],
          });
          return jest.fn();
        }),
      })),
    })),
    getCollectionPath: jest.fn((storeId, collection) => `stores/${storeId}/${collection}`),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  describe('createSale', () => {
    it('should create a new sale', async () => {
      const createSaleDto = {
        items: [
          {
            productId: 'product-1',
            quantity: 2,
            unitPrice: 50,
            discount: 0,
          },
        ],
        payment: {
          method: 'cash',
          amount: 100,
          status: 'approved',
        },
        status: 'completed',
      };

      const result = await service.createSale('store-123', 'cashier-1', createSaleDto);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('completed');
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('getSaleById', () => {
    it('should get a sale by id', async () => {
      const result = await service.getSaleById('store-123', 'sale-123');

      expect(result).toHaveProperty('id');
      expect(result.id).toBe('sale-123');
    });
  });

  describe('listSales', () => {
    it('should list sales with pagination and filtering', async () => {
      const result = await service.listSales('store-123', 1, 20, 'completed');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('updateSaleStatus', () => {
    it('should update sale status', async () => {
      const result = await service.updateSaleStatus('store-123', 'sale-123', 'cancelled');

      expect(result).toBeDefined();
    });

    it('should reject invalid status', async () => {
      await expect(service.updateSaleStatus('store-123', 'sale-123', 'invalid')).rejects.toThrow();
    });
  });

  describe('getSalesStats', () => {
    it('should get sales statistics', async () => {
      const result = await service.getSalesStats('store-123');

      expect(result).toHaveProperty('totalSales');
      expect(result).toHaveProperty('totalAmount');
      expect(result).toHaveProperty('averageTicket');
    });
  });

  describe('setupRealtimeListener', () => {
    it('should setup real-time listener', () => {
      const callback = jest.fn();
      const unsubscribe = service.setupRealtimeListener('store-123', callback);

      expect(typeof unsubscribe).toBe('function');
      expect(callback).toHaveBeenCalled();
    });
  });
});
