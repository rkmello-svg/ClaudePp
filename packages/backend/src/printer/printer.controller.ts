import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/printer')
@UseGuards(JwtAuthGuard)
export class PrinterController {
  constructor(private printerService: PrinterService) {}

  @Post('print-receipt')
  async printReceipt(@Body() body: { saleId: string; content: string }, @Request() req) {
    return this.printerService.printReceipt(req.user.storeId, body.saleId, body.content);
  }

  @Post('test-print')
  async testPrint(@Request() req) {
    return this.printerService.testPrint(req.user.storeId);
  }

  @Get('status')
  async getPrinterStatus(@Request() req) {
    return this.printerService.getPrinterStatus(req.user.storeId);
  }
}
