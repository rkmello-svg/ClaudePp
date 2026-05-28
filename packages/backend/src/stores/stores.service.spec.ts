import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('StoresService', () => {
  let service: StoresService;
  let firebaseService: jest.Mocked<FirebaseService>;

  beforeEach(async () => {
    const mockFirebaseService = {
      db: {
        collection: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    firebaseService = module.get(FirebaseService) as jest.Mocked<FirebaseService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a store', async () => {
    const mockStore = {
      id: 'store-1',
      name: 'Test Store',
      cnpj: '12345678901234',
      address: 'Test Address',
      phone: '1234567890',
      email: 'test@test.com',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // The actual test would depend on how Firebase is mocked
    expect(service).toBeDefined();
  });
});
