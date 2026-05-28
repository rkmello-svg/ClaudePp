import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  getLogs(@Request() req, @Query() filter?: any) {
    return this.auditService.getLogs(req.user.storeId, filter);
  }

  @Get('user-actions/:userId')
  getUserActions(@Param('userId') userId: string, @Request() req) {
    return this.auditService.getUserActions(req.user.storeId, userId);
  }

  @Get('product-changes/:productId')
  getProductChanges(@Param('productId') productId: string, @Request() req) {
    return this.auditService.getProductChanges(req.user.storeId, productId);
  }
}
