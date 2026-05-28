import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StoneProvider } from './providers/stone-provider';
import { EloProvider } from './providers/elo-provider';
import { IngenicProvider } from './providers/ingenico-provider';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  providers: [
    PaymentsService,
    {
      provide: 'STONE_PROVIDER',
      useClass: StoneProvider,
    },
    {
      provide: 'ELO_PROVIDER',
      useClass: EloProvider,
    },
    {
      provide: 'INGENICO_PROVIDER',
      useClass: IngenicProvider,
    },
    FirebaseService,
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
