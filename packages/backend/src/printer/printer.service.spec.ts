import { Test, TestingModule } from '@nestjs/testing';
import { PrinterService } from './printer.service';
import { PrintQueueService } from './queue/print-queue.service';
import { EscposProvider } from './providers/escpos-provider';
import { FirebaseService } from '../firebase/firebase.service';

describe('PrinterService', () => {
  let service: PrinterService;
  let printQueueService: jest.Mocked<PrintQueueService>;
  let escposProvider: EscposProvider;

  beforeEach(async () => {
    const mockPrintQueue = {
      addPrintJob: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrinterService,
        {
          provide: PrintQueueService,
          useValue: mockPrintQueue,
        },
        EscposProvider,
        {
          provide: FirebaseService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PrinterService>(PrinterService);
    printQueueService = module.get(PrintQueueService) as jest.Mocked<PrintQueueService>;
    escposProvider = module.get<EscposProvider>(EscposProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should print receipt', async () => {
    const result = await service.printReceipt('store-1', 'sale-1', 'Receipt content');
    expect(result).toBeDefined();
  });

  it('should test printer', async () => {
    const result = await service.testPrint('store-1');
    expect(result).toBe(true);
  });
});
