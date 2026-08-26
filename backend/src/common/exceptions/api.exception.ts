import { HttpException, HttpStatus } from '@nestjs/common';
import type { ErrorCode } from '../types/error-codes';

export class ApiException extends HttpException {
  constructor(
    code: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: unknown,
  ) {
    super({ error: { code, message, details } }, status);
  }
}

export class NotFoundException extends ApiException {
  constructor(message = 'Resource not found', details?: unknown) {
    super('NOT_FOUND', message, HttpStatus.NOT_FOUND, details);
  }
}

export class ConflictException extends ApiException {
  constructor(message = 'Resource already exists', details?: unknown) {
    super('CONFLICT', message, HttpStatus.CONFLICT, details);
  }
}

export class ForbiddenException extends ApiException {
  constructor(message = 'Forbidden', details?: unknown) {
    super('FORBIDDEN', message, HttpStatus.FORBIDDEN, details);
  }
}

export class TenantBlockedException extends ApiException {
  constructor(message = 'Business is suspended or expired', details?: unknown) {
    super('TENANT_BLOCKED', message, HttpStatus.FORBIDDEN, details);
  }
}

export class TenantPendingException extends ApiException {
  constructor(message = 'Business registration is awaiting approval', details?: unknown) {
    super('TENANT_PENDING', message, HttpStatus.FORBIDDEN, details);
  }
}

export class PlanRequiredException extends ApiException {
  constructor(feature: string, details?: unknown) {
    super(
      'PLAN_REQUIRED',
      `Your plan does not include: ${feature}. Upgrade to unlock it.`,
      HttpStatus.FORBIDDEN,
      details,
    );
  }
}

export class SeatLimitException extends ApiException {
  constructor(message = 'Seat limit reached for your plan', details?: unknown) {
    super('SEAT_LIMIT_REACHED', message, HttpStatus.CONFLICT, details);
  }
}

export class InsufficientStockException extends ApiException {
  constructor(productName: string, available: number, requested: number) {
    super(
      'INSUFFICIENT_STOCK',
      `Insufficient stock for "${productName}" (available ${available}, requested ${requested})`,
      HttpStatus.CONFLICT,
      { productName, available, requested },
    );
  }
}

export class IdempotencyConflictException extends ApiException {
  constructor(message = 'A request with this idempotency key already exists', details?: unknown) {
    super('IDEMPOTENCY_CONFLICT', message, HttpStatus.CONFLICT, details);
  }
}
