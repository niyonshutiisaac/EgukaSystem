/** Machine-readable error codes used across the API. */
export const ErrorCodes = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL: 'INTERNAL',
  RATE_LIMITED: 'RATE_LIMITED',
  TENANT_BLOCKED: 'TENANT_BLOCKED',
  TENANT_PENDING: 'TENANT_PENDING',
  PLAN_REQUIRED: 'PLAN_REQUIRED',
  SEAT_LIMIT_REACHED: 'SEAT_LIMIT_REACHED',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  AI_CREDITS_EXHAUSTED: 'AI_CREDITS_EXHAUSTED',
  AI_UNAVAILABLE: 'AI_UNAVAILABLE',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/** Standard error envelope: { error: { code, message, details? } } */
export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}
