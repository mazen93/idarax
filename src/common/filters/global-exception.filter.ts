import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

/**
 * GlobalExceptionFilter — catches all unhandled exceptions in the app and
 * normalises responses into a consistent JSON envelope:
 *
 *   { status: false, code: <http_status>, message: "...", data: null }
 *
 * Handles:
 *  - HttpException (NestJS / manual throws)
 *  - Prisma known errors  (P2002 unique, P2025 not-found, P2003 fk violation)
 *  - Prisma validation errors
 *  - All other unexpected errors (500)
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    // ── NestJS HttpException ──────────────────────────────────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const bodyObj = body as Record<string, any>;
        // Handle class-validator error arrays
        if (Array.isArray(bodyObj.message)) {
          message = bodyObj.message.join('; ');
        } else {
          message = bodyObj.message ?? message;
        }
      }
    }

    // ── Prisma known request errors ───────────────────────────────────────
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          const fields = (exception.meta?.target as string[])?.join(', ') ?? 'field';
          message = `A record with this ${fields} already exists`;
          status = HttpStatus.CONFLICT;
          break;
        }
        case 'P2025':
          message = exception.meta?.cause as string ?? 'Record not found';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'Related record not found (foreign key constraint failed)';
          status = HttpStatus.BAD_REQUEST;
          break;
        case 'P2014':
          message = 'Invalid relation — violates required constraint';
          status = HttpStatus.BAD_REQUEST;
          break;
        default:
          message = `Database error: ${exception.code}`;
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    // ── Prisma validation errors ──────────────────────────────────────────
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      message = 'Invalid data provided to the database';
      status = HttpStatus.BAD_REQUEST;
    }

    // ── Unknown errors ────────────────────────────────────────────────────
    else if (exception instanceof Error) {
      message = exception.message || message;
    }

    // Only log 5xx errors to avoid noise
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} → ${status}: ${message}`);
    }

    response.status(status).json({
      status: false,
      code: status,
      message,
      data: null,
    });
  }
}
