import { Test, TestingModule } from '@nestjs/testing';
import { CashRegisterService } from './cash-register.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('CashRegisterService', () => {
  let service: CashRegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashRegisterService,
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

    service = module.get<CashRegisterService>(CashRegisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create cash register', async () => {
    const register = await service.createRegister('store-1', 'Caixa 1', 1);
    expect(register).toBeDefined();
    expect(register.name).toBe('Caixa 1');
  });

  it('should open shift', async () => {
    const shift = await service.openShift('register-1', 'store-1', 'cashier-1', 100);
    expect(shift).toBeDefined();
    expect(shift.status).toBe('open');
    expect(shift.openingBalance).toBe(100);
  });
});
