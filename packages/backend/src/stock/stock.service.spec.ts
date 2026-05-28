import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './services/stock.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('StockService', () => {
  let service: StockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: FirebaseService,
          useValue: {
            db: {
              collection: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should adjust stock', async () => {
    const result = await service.adjustStock('store-1', 'product-1', 10, 'Initial stock', 'user-1');
    expect(result).toBeDefined();
    expect(result.type).toBe('adjustment');
  });
});
