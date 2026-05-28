import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SalesModule } from './sales/sales.module';
import { ProductsModule } from './products/products.module';
// Phase 3: Machine Integration Modules
import { PaymentsModule } from './payments/payments.module';
import { PrinterModule } from './printer/printer.module';
import { BarcodeModule } from './barcode/barcode.module';
// Phase 4: Enterprise Modules
import { StoresModule } from './stores/stores.module';
import { StockModule } from './stock/stock.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { CashRegisterModule } from './cash-register/cash-register.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
    }),
    AuthModule,
    SalesModule,
    ProductsModule,
    // Phase 3 Modules
    PaymentsModule,
    PrinterModule,
    BarcodeModule,
    // Phase 4 Modules
    StoresModule,
    StockModule,
    ReportsModule,
    AuditModule,
    CashRegisterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
