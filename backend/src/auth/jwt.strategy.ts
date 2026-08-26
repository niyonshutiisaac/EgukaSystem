import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../common/types/auth-user';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string | null;
  planId: string | null;
  isSuperadmin: boolean;
  iat: number;
  exp: number;
}

const USER_CACHE_TTL = 60;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.accessSecret') ?? 'dev-access-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const cached = await this.redis.get<AuthUser>(`user:${payload.sub}`);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { tenant: { select: { status: true, planId: true } } },
    });

    if (!user || user.status === 'disabled') {
      throw new Error('User not found or disabled');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      planId: user.tenant?.planId ?? null,
      tenantStatus: user.tenant?.status ?? null,
      isSuperadmin: user.role === 'superadmin',
    };

    await this.redis.set(`user:${user.id}`, authUser, USER_CACHE_TTL);
    return authUser;
  }
}
