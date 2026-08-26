import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('movements')
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId?: string,
    @Query('type') type?: MovementType,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventory.listMovements(tenantId, {
      productId,
      type,
      cursor,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('movements/product/:productId')
  byProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('productId') productId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventory.listMovements(tenantId, {
      productId,
      cursor,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }
}
