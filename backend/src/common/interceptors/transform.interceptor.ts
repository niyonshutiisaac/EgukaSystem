import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponseEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Wraps all successful responses in { data, meta? }.
 * Controllers that already return { data } (e.g. paginated lists) are detected
 * via a `meta` property and left untouched.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseEnvelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponseEnvelope<T>> {
    return next.handle().pipe(
      map((payload) => {
        if (
          payload !== null &&
          typeof payload === 'object' &&
          'data' in payload &&
          'meta' in payload
        ) {
          return payload as ApiResponseEnvelope<T>;
        }
        return { data: payload };
      }),
    );
  }
}
