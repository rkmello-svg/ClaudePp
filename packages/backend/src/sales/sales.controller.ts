import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/sales')
export class SalesController {
  private readonly logger = new Logger(SalesController.name);

  constructor(private salesService: SalesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSale(@Request() req: any, @Body() createSaleDto: CreateSaleDto) {
    this.logger.log(`Creating sale for store: ${req.user.storeId}`);
    const sale = await this.salesService.createSale(req.user.storeId, req.user.uid, createSaleDto);
    return {
      success: true,
      data: sale,
      timestamp: new Date(),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listSales(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    this.logger.log('Listing sales');
    const result = await this.salesService.listSales(
      req.user.storeId,
      parseInt(page),
      parseInt(limit),
      status,
    );
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date(),
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getSalesStats(@Request() req: any) {
    this.logger.log('Getting sales statistics');
    const stats = await this.salesService.getSalesStats(req.user.storeId);
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getSale(@Request() req: any, @Param('id') saleId: string) {
    this.logger.log(`Fetching sale: ${saleId}`);
    const sale = await this.salesService.getSaleById(req.user.storeId, saleId);
    return {
      success: true,
      data: sale,
      timestamp: new Date(),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateSale(
    @Request() req: any,
    @Param('id') saleId: string,
    @Body() updateData: any,
  ) {
    this.logger.log(`Updating sale: ${saleId}`);
    const sale = await this.salesService.updateSaleStatus(req.user.storeId, saleId, updateData.status);
    return {
      success: true,
      data: sale,
      timestamp: new Date(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteSale(@Request() req: any, @Param('id') saleId: string) {
    this.logger.log(`Canceling sale: ${saleId}`);
    const sale = await this.salesService.cancelSale(req.user.storeId, saleId);
    return {
      success: true,
      data: sale,
      timestamp: new Date(),
    };
  }
}
