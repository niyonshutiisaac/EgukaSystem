import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { AdjustStockDto, CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('search') search?: string,
    @Query('ingredientOnly') ingredientOnly?: string,
    @Query('activeOnly') activeOnly?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.products.list(tenantId, {
      search,
      ingredientOnly: ingredientOnly === 'true',
      activeOnly: activeOnly === 'true',
      cursor,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('low-stock')
  lowStock(@CurrentUser('tenantId') tenantId: string) {
    return this.products.getLowStock(tenantId);
  }

  @Get(':id')
  getOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.products.getById(tenantId, id);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateProductDto) {
    return this.products.create(tenantId, null, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(tenantId, id, dto);
  }

  @Post(':id/adjust-stock')
  adjustStock(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.products.adjustStock(user.tenantId!, id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.products.remove(tenantId, id);
  }
}
