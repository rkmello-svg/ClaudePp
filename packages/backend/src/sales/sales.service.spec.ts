import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateSaleDto } from './dto/create-sale.dto';

describe('SalesService', () => {
  let service: SalesService;
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    getFirestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        doc: jest.fn((id: string) => ({
          set: jest.fn().mockResolvedValue(undefined),
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              id,
              total: 100,
              items: [{ id: 'item-1' }],
              status: 'completed',
              createdAt: new Date(),
            }),
          }),
          update: jest.fn().mockResolvedValue(undefined),
        })),
        where: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [
              {
                data: () => ({
                  id: 'sale-1',
                  total: 100,
                  items: [{ id: 'item-1' }],
                  status: 'completed',
                  createdAt: new Date(),
                }),
              },
            ],
          }),
        }),
        orderBy: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          offset: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [
              {
                id: 'sale-1',
                data: () => ({
                  id: 'sale-1',
                  total: 100,
                  items: [{ id: 'item-1' }],
                  status: 'completed',
                  createdAt: new Date(),
                }),
              },
            ],
          }),
        }),
        onSnapshot: jest.fn(),
      }),
    }),
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
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSale', () => {
    it('should create a new sale', async () => {
      const createSaleDto: CreateSaleDto = {
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            unitPrice: 50,
            discount: 0,
          },
        ],
        payment: {
          method: 'cash',
          amount: 110,
          status: 'approved',
        },
        discountPercent: 0,
        status: 'completed',
      };

      const result = await service.createSale('store-123', 'cashier-1', createSaleDto);

      expect(result).toHaveProperty('id');
      expect(result.subtotal).toBe(100);
      expect(result.total).toBeGreaterThan(100); // includes tax
      expect(result.items).toHaveLength(1);
    });
  });

  describe('getSaleById', () => {
    it('should return sale by id', async () => {
      const result = await service.getSaleById('store-123', 'sale-1');

      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('id');
        expect(result.total).toBe(100);
      }
    });

    it('should throw NotFoundException if sale not found', async () => {
      mockFirebaseService.getFirestore().collection().doc().get.mockResolvedValueOnce({
        exists: false,
      });

      await expect(service.getSaleById('store-123', 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelSale', () => {
    it('should cancel a sale', async () => {
      const result = await service.cancelSale('store-123', 'sale-1');

      expect(result).toHaveProperty('status');
    });
  });

  describe('listSales', () => {
    it('should return paginated sales with correct offset and limit', async () => {
      const result = await service.listSales('store-123', 1, 20);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });
  });

  describe('getSalesStats', () => {
    it('should return sales statistics', async () => {
      const result = await service.getSalesStats('store-123');

      expect(result).toHaveProperty('totalSales');
      expect(result).toHaveProperty('totalAmount');
      expect(result).toHaveProperty('totalItems');
      expect(result).toHaveProperty('averageTicket');
    });
  });
});
