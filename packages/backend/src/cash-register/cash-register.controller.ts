import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CashRegisterService } from './cash-register.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/cash-registers')
@UseGuards(JwtAuthGuard)
export class CashRegisterController {
  constructor(private cashRegisterService: CashRegisterService) {}

  @Post()
  create(@Body() body: { name: string; number: number }, @Request() req) {
    return this.cashRegisterService.createRegister(req.user.storeId, body.name, body.number);
  }

  @Get()
  list(@Request() req) {
    return this.cashRegisterService.listRegisters(req.user.storeId);
  }

  @Get(':id')
  get(@Param('id') id: string, @Request() req) {
    return this.cashRegisterService.getRegister(req.user.storeId, id);
  }

  @Post(':id/open')
  openShift(@Param('id') id: string, @Body() body: { cashierId: string; openingBalance: number }, @Request() req) {
    return this.cashRegisterService.openShift(id, req.user.storeId, body.cashierId, body.openingBalance);
  }

  @Post(':id/close')
  closeShift(@Param('id') id: string, @Body() body: { shiftId: string; closingBalance: number }, @Request() req) {
    return this.cashRegisterService.closeShift(id, req.user.storeId, body.shiftId, body.closingBalance);
  }

  @Get(':id/shifts/:shiftId/summary')
  getShiftSummary(@Param('id') id: string, @Param('shiftId') shiftId: string, @Request() req) {
    return this.cashRegisterService.getShiftSummary(id, req.user.storeId, shiftId);
  }
}
