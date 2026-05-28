import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { StockService } from './services/stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private stockService: StockService) {}

  @Get()
  getStock(@Request() req, @Param('productId') productId?: string) {
    return this.stockService.getStock(req.user.storeId, productId);
  }

  @Patch(':productId')
  adjustStock(
    @Param('productId') productId: string,
    @Body() body: { quantity: number; reason: string },
    @Request() req,
  ) {
    return this.stockService.adjustStock(req.user.storeId, productId, body.quantity, body.reason, req.user.id);
  }

  @Get('movements')
  getMovements(@Request() req) {
    return this.stockService.getMovements(req.user.storeId);
  }

  @Get('alerts')
  getAlerts(@Request() req) {
    return this.stockService.getAlerts(req.user.storeId);
  }
}
