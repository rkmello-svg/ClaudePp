import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
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

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create audit log', async () => {
    const log = await service.log('store-1', {
      userId: 'user-1',
      action: 'CREATE',
      resource: 'PRODUCT',
      resourceId: 'product-1',
      status: 'success',
    });
    expect(log).toBeDefined();
    expect(log.status).toBe('success');
  });
});
