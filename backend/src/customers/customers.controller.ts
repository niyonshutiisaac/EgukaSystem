import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, RecordPaymentDto, UpdateCustomerDto } from './dto/customer.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('search') search?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customers.list(tenantId, {
      search,
      cursor,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  getOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.customers.getById(tenantId, id);
  }

  @Get(':id/ledger')
  ledger(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.customers.ledger(tenantId, id, cursor);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateCustomerDto) {
    return this.customers.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customers.update(tenantId, id, dto);
  }

  @Post(':id/payments')
  recordPayment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.customers.recordPayment(user.tenantId!, id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.customers.remove(tenantId, id);
  }
}
