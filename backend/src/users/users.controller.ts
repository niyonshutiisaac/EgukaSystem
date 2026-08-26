import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { InviteUserDto, UpdateUserDto } from './dto/user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Roles(Role.owner, Role.manager)
  @Get()
  list(@CurrentUser('tenantId') tenantId: string, @Query('role') role?: Role) {
    return this.users.list(tenantId, role);
  }

  @Roles(Role.owner, Role.manager)
  @Post('invite')
  invite(@CurrentUser('tenantId') tenantId: string, @Body() dto: InviteUserDto) {
    return this.users.invite(tenantId, dto);
  }

  @Roles(Role.owner, Role.manager)
  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(user.tenantId!, id, dto, user.role);
  }

  @Roles(Role.owner)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.users.remove(user.tenantId!, id, user.id, user.role);
  }
}
