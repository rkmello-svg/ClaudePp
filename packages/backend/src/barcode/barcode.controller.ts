import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BarcodeService } from './barcode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/barcode')
@UseGuards(JwtAuthGuard)
export class BarcodeController {
  constructor(private barcodeService: BarcodeService) {}

  @Post('validate')
  async validateBarcode(@Body() body: { barcode: string }) {
    return this.barcodeService.validateBarcode(body.barcode);
  }

  @Get('search/:code')
  async searchByBarcode(@Param('code') code: string, @Request() req) {
    return this.barcodeService.searchByBarcode(code, req.user.storeId);
  }
}
