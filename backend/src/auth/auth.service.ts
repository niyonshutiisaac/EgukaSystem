import { createHash, randomBytes } from 'crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, TenantStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuthUser } from '../common/types/auth-user';
import { ApiException, NotFoundException } from '../common/exceptions/api.exception';
import { LoginDto, RegisterDto } from './dto/auth.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionResponse {
  user: AuthUser;
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: TenantStatus;
    planId: string;
    trialEndsAt: Date | null;
  } | null;
  tokens: TokenPair;
}

const REFRESH_PREFIX = 'refresh:';
const PASSWORD_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ---------------------------------------------------------------------------
  // Registration
  // ---------------------------------------------------------------------------

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const slug = await this.generateSlug(dto.businessName);

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.businessName.trim(),
        slug,
        businessType: dto.businessType,
        email,
        phone: dto.phone ?? '',
        countryCode: '+250',
        region: dto.region,
        district: dto.district,
        status: 'pending',
        planId: 'starter',
        subscriptions: {
          create: {
            planId: 'starter',
            status: 'active',
            amount: 15000,
            startedAt: new Date(),
            renewsAt: new Date(Date.now() + 30 * 86400000),
          },
        },
        registrationRequest: {
          create: {},
        },
      },
    });

    await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        name: dto.ownerName.trim(),
        passwordHash,
        role: Role.owner,
        phone: dto.phone,
      },
    });

    const branch = await this.prisma.branch.create({
      data: { tenantId: tenant.id, name: 'Main Branch', isDefault: true },
    });

    return {
      id: tenant.id,
      status: TenantStatus.pending,
      slug,
      branchId: branch.id,
      message:
        'Registration submitted. A platform admin will approve your business — usually within 24 hours.',
    };
  }

  private async generateSlug(businessName: string): Promise<string> {
    const base = businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    const core = base || 'business';

    for (let i = 0; i < 10; i++) {
      const suffix = i === 0 ? '' : `-${randomBytes(3).toString('hex')}`;
      const slug = `${core}${suffix}`;
      const exists = await this.prisma.tenant.findUnique({ where: { slug } });
      if (!exists) return slug;
    }
    return `${core}-${Date.now().toString(36)}`;
  }

  // ---------------------------------------------------------------------------
  // Login / tokens
  // ---------------------------------------------------------------------------

  async login(dto: LoginDto): Promise<SessionResponse> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    if (user.status === 'disabled') {
      throw new UnauthorizedException({
        error: { code: 'ACCOUNT_DISABLED', message: 'This account has been disabled' },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      planId: user.tenant?.planId ?? null,
      tenantStatus: user.tenant?.status ?? null,
      isSuperadmin: user.role === Role.superadmin,
    };

    const tokens = await this.issueTokens(authUser);
    await this.redis.set(`user:${user.id}`, authUser, 60);

    return {
      user: authUser,
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
            status: user.tenant.status,
            planId: user.tenant.planId,
            trialEndsAt: user.tenant.trialEndsAt,
          }
        : null,
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const jti = this.jtiOf(refreshToken);
    if (!jti) {
      throw new UnauthorizedException({
        error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' },
      });
    }

    const redisKey = `${REFRESH_PREFIX}${jti}`;
    const stored = await this.redis.get<{ userId: string }>(redisKey);
    if (!stored) {
      throw new UnauthorizedException({
        error: { code: 'UNAUTHORIZED', message: 'Refresh token expired' },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      include: { tenant: { select: { status: true, planId: true } } },
    });
    if (!user || user.status === 'disabled') {
      throw new UnauthorizedException({
        error: { code: 'UNAUTHORIZED', message: 'Account unavailable' },
      });
    }

    await this.redis.del(redisKey); // rotate: old token is single-use

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      planId: user.tenant?.planId ?? null,
      tenantStatus: user.tenant?.status ?? null,
      isSuperadmin: user.role === Role.superadmin,
    };

    return this.issueTokens(authUser);
  }

  async logout(refreshToken: string): Promise<void> {
    const jti = this.jtiOf(refreshToken);
    if (jti) {
      await this.redis.del(`${REFRESH_PREFIX}${jti}`);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new ApiException('INVALID_CREDENTIALS', 'Current password is incorrect', 400);
    }
    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await this.redis.del(`user:${userId}`);
    await this.revokeAllSessions(userId);
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private async issueTokens(user: AuthUser): Promise<TokenPair> {
    const accessTtl = this.config.get<number>('auth.accessTtlSeconds') ?? 900;
    const refreshTtl = this.config.get<number>('auth.refreshTtlSeconds') ?? 2592000;

    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        planId: user.planId,
        isSuperadmin: user.isSuperadmin,
      },
      {
        secret: this.config.get<string>('auth.accessSecret'),
        expiresIn: accessTtl,
      },
    );

    const refreshToken = randomBytes(32).toString('hex');
    const jti = this.jtiOf(refreshToken)!;
    await this.redis.set(`${REFRESH_PREFIX}${jti}`, { userId: user.id }, refreshTtl);

    return { accessToken, refreshToken, expiresIn: accessTtl };
  }

  private jtiOf(refreshToken: string): string | null {
    if (!/^[a-f0-9]{64}$/.test(refreshToken)) return null;
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    const keys = await this.redis.raw?.keys(`${REFRESH_PREFIX}*`);
    if (!keys) return;
    const batch = keys.filter(async (k) => {
      const v = await this.redis.get<{ userId: string }>(k);
      return v?.userId === userId;
    });
    for (const key of await Promise.all(batch)) {
      await this.redis.del(key);
    }
  }
}
