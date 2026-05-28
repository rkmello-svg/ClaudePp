import { Test, TestingModule } from '@nestjs/testing';
import { BarcodeService } from './barcode.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('BarcodeService', () => {
  let service: BarcodeService;

  beforeEach(async () => {
    const mockFirebaseService = {
      db: {
        collection: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BarcodeService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<BarcodeService>(BarcodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate EAN-13 barcode', async () => {
    const result = await service.validateBarcode('5901234123457');
    expect(result.valid).toBe(true);
    expect(result.format).toBe('EAN-13');
  });

  it('should reject invalid EAN-13', async () => {
    const result = await service.validateBarcode('1234567890');
    expect(result.valid).toBe(false);
  });
});
