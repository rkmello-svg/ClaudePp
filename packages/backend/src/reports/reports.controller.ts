import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales')
  sales(@Query('startDate') start: string, @Query('endDate') end: string, @Request() req) {
    return this.reportsService.generateSalesReport(req.user.storeId, new Date(start), new Date(end));
  }

  @Get('products-ranking')
  productsRanking(@Query('startDate') start: string, @Query('endDate') end: string, @Request() req) {
    return this.reportsService.generateProductRanking(req.user.storeId, new Date(start), new Date(end));
  }

  @Get('cashier-performance')
  cashierPerformance(@Query('startDate') start: string, @Query('endDate') end: string, @Request() req) {
    return this.reportsService.generateCashierPerformance(req.user.storeId, new Date(start), new Date(end));
  }

  @Get('revenue')
  revenue(@Query('startDate') start: string, @Query('endDate') end: string, @Request() req) {
    return this.reportsService.generateRevenueMetrics(req.user.storeId, new Date(start), new Date(end));
  }
}
