import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
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

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate sales report', async () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const result = await service.generateSalesReport('store-1', start, end);
    expect(result).toBeDefined();
    expect(result.period.startDate).toEqual(start);
  });
});
