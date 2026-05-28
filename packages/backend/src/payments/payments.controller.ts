import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('process-card')
  async processCardPayment(@Body() dto: ProcessPaymentDto, @Request() req) {
    return this.paymentsService.processCardPayment(dto, req.user.storeId);
  }

  @Post('process-pix')
  async processPixPayment(@Body() dto: ProcessPaymentDto, @Request() req) {
    return this.paymentsService.processPixPayment(dto, req.user.storeId);
  }

  @Post('process-cash')
  async processCashPayment(@Body() dto: ProcessPaymentDto, @Request() req) {
    return this.paymentsService.processCashPayment(dto, req.user.storeId);
  }

  @Get('status/:transactionId')
  async getPaymentStatus(@Param('transactionId') id: string, @Request() req) {
    return this.paymentsService.getPaymentStatus(id, req.user.storeId);
  }

  @Get('methods')
  async getAvailableMethods(@Request() req) {
    return this.paymentsService.getAvailableMethods(req.user.storeId);
  }
}
