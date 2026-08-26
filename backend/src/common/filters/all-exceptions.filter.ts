import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorBody, ErrorCodes } from '../types/error-codes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiErrorBody = {
      error: { code: ErrorCodes.INTERNAL, message: 'Internal server error' },
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'error' in res) {
        body = res as ApiErrorBody;
      } else if (typeof res === 'string') {
        body = { error: { code: ErrorCodes.BAD_REQUEST, message: res } };
      } else {
        body = {
          error: {
            code: ErrorCodes.BAD_REQUEST,
            message: (res as { message?: string }).message ?? 'Bad request',
            details: (res as { message?: string }).message,
          },
        };
      }
    } else if (exception instanceof Error) {
      body = { error: { code: ErrorCodes.INTERNAL, message: 'Internal server error' } };
      this.logger.error(
        `${request.method} ${request.url} -> ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json(body);
  }
}
