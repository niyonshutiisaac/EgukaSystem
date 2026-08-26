import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SaleStatus } from '@prisma/client';
import { SalesService } from './sales.service';
import { CreateSaleDto, VoidSaleDto } from './dto/sale.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSaleDto) {
    return this.sales.create(user.tenantId!, user.id, dto);
  }

  @Get()
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: SaleStatus,
    @Query('customerId') customerId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.sales.list(tenantId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      customerId,
      from,
      to,
    });
  }

  @Get('summary')
  summary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.sales.summary(tenantId, from, to);
  }

  @Get(':id')
  getOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.sales.findById(tenantId, id);
  }

  @Patch(':id/void')
  void(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: VoidSaleDto) {
    return this.sales.void(user.tenantId!, id, user.id, dto);
  }
}
