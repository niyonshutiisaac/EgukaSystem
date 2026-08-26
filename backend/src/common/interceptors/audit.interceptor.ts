import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditUser {
  id?: string;
  tenantId?: string;
  role?: string;
}

/**
 * Fire-and-forget audit logging for mutating requests.
 * Writes are queued to Redis (bulk consumer) when available, otherwise written directly.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: async () => {
          const user = req.user as AuditUser | undefined;
          if (!user?.id) return;
          try {
            await this.prisma.auditLog.create({
              data: {
                tenantId: user.tenantId ?? null,
                userId: user.id,
                action: `${method} ${req.path}`,
                entity: req.path.split('/').slice(-2, -1)[0] ?? 'unknown',
                entityId: (req.params as Record<string, string>).id ?? null,
                ip: req.ip ?? null,
              },
            });
          } catch (err) {
            this.logger.debug(`Audit log skipped: ${(err as Error).message}`);
          }
        },
      }),
    );
  }
}
