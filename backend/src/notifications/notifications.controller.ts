import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('limit') limit?: string) {
    if (user.tenantId) {
      return this.notifications.listForTenant(user.tenantId, limit ? parseInt(limit, 10) : 20);
    }
    return this.notifications.listForUser(user.id, limit ? parseInt(limit, 10) : 20);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: AuthUser) {
    return { count: this.notifications.unreadCount(user.id, user.tenantId) };
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.notifications.markRead(id, user.id, user.tenantId);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.notifications.markAllRead(user.id, user.tenantId);
  }
}
