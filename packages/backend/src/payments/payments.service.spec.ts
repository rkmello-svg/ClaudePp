import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { FirebaseService } from '../firebase/firebase.service';
import { StoneProvider } from './providers/stone-provider';
import { EloProvider } from './providers/elo-provider';
import { IngenicProvider } from './providers/ingenico-provider';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let firebaseService: jest.Mocked<FirebaseService>;
  let stoneProvider: StoneProvider;

  beforeEach(async () => {
    const mockFirebaseService = {
      db: {
        collection: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: 'STONE_PROVIDER',
          useValue: new StoneProvider(),
        },
        {
          provide: 'ELO_PROVIDER',
          useValue: new EloProvider(),
        },
        {
          provide: 'INGENICO_PROVIDER',
          useValue: new IngenicProvider(),
        },
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    firebaseService = module.get(FirebaseService) as jest.Mocked<FirebaseService>;
    stoneProvider = module.get('STONE_PROVIDER');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process card payment', async () => {
    const mockDoc = {
      set: jest.fn().mockResolvedValue(undefined),
    };
    const mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
    };
    const mockStore = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    firebaseService.db.collection = jest.fn().mockReturnValue(mockStore);

    const dto = {
      saleId: '123',
      amount: 100,
      method: 'card' as const,
      cardData: {
        number: '4111111111111111',
        holderName: 'Test User',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
      },
    };

    const result = await service.processCardPayment(dto, 'store-123');

    expect(result).toBeDefined();
    expect(result.status).toBe('approved');
    expect(result.method).toBe('card');
  });
});
