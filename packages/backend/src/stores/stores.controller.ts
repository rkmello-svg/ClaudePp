import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Store } from '@claudepp/shared';

@Controller('api/v1/stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Post()
  create(@Body() data: Partial<Store>) {
    return this.storesService.createStore(data);
  }

  @Get()
  list() {
    return this.storesService.listStores();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.storesService.getStore(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Store>) {
    return this.storesService.updateStore(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.storesService.deleteStore(id);
  }

  @Get(':id/kpis')
  getKPIs(@Param('id') id: string) {
    return this.storesService.getStoreKPIs(id);
  }
}
