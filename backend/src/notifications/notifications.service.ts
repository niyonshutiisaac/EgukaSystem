import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { userId, OR: [{ readAt: null }, { readAt: { not: null } }] },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async listForTenant(tenantId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async unreadCount(userId: string, tenantId: string | null): Promise<number> {
    return this.prisma.notification.count({
      where: {
        readAt: null,
        OR: [{ userId }, ...(tenantId ? [{ tenantId }] : [])],
      },
    });
  }

  async markRead(notificationId: string, userId: string, tenantId: string | null) {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        OR: [{ userId }, ...(tenantId ? [{ tenantId }] : [])],
      },
      data: { readAt: new Date() },
    });
    return { read: true };
  }

  async markAllRead(userId: string, tenantId: string | null) {
    await this.prisma.notification.updateMany({
      where: {
        readAt: null,
        OR: [{ userId }, ...(tenantId ? [{ tenantId }] : [])],
      },
      data: { readAt: new Date() },
    });
    return { read: true };
  }

  async create(input: {
    tenantId?: string | null;
    userId?: string | null;
    type: string;
    title: string;
    body: string;
  }) {
    return this.prisma.notification.create({
      data: {
        tenantId: input.tenantId ?? null,
        userId: input.userId ?? null,
        type: input.type,
        title: input.title,
        body: input.body,
      },
    });
  }
}
