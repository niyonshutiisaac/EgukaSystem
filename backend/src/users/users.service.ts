import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  SeatLimitException,
} from '../common/exceptions/api.exception';
import { InviteUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async list(tenantId: string, role?: Role) {
    return this.prisma.user.findMany({
      where: { tenantId, ...(role ? { role } : {}) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async invite(tenantId: string, dto: InviteUserDto) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const [seatsUsed, plan] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.plan.findFirst({
        where: { tenants: { some: { id: tenantId } } },
      }),
    ]);

    if (!plan) throw new NotFoundException('Plan not found');
    if (seatsUsed >= plan.seats) {
      throw new SeatLimitException(
        `Seat limit reached (${seatsUsed}/${plan.seats}). Upgrade your plan to add more users.`,
        { seatsUsed, seatsLimit: plan.seats },
      );
    }

    const temporaryPassword = dto.temporaryPassword ?? randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email,
        name: dto.name ?? email.split('@')[0],
        passwordHash,
        role: dto.role,
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    await this.redis.del(`tenant:profile:${tenantId}`);

    return { ...user, temporaryPassword };
  }

  async update(tenantId: string, userId: string, dto: UpdateUserDto, actorRole: Role) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'owner' && actorRole !== 'owner') {
      throw new ForbiddenException('Only the owner can modify owner accounts');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, email: true, name: true, role: true, status: true },
    });
    await this.redis.del(`user:${userId}`);
    return updated;
  }

  async remove(tenantId: string, userId: string, actorId: string, actorRole: Role) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.id === actorId) {
      throw new ForbiddenException('You cannot remove your own account');
    }
    if (user.role === 'owner' && actorRole !== 'owner') {
      throw new ForbiddenException('Only the owner can remove the owner');
    }

    const ownersLeft = await this.prisma.user.count({
      where: { tenantId, role: 'owner', status: 'active' },
    });
    if (user.role === 'owner' && ownersLeft <= 1) {
      throw new ForbiddenException('A business must keep at least one owner');
    }

    await this.prisma.user.delete({ where: { id: userId } });
    await this.redis.del(`user:${userId}`);
    await this.redis.del(`tenant:profile:${tenantId}`);
    return { deleted: true };
  }
}
