import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import * as Sentry from '@sentry/nestjs';
import { TenantService } from '../../tenant/tenant.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly tenantService: TenantService) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();
        
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();

        // Report to Sentry if it's a 500 error or an unhandled exception
        if (status >= 500 || !(exception instanceof HttpException)) {
            Sentry.withScope((scope) => {
                scope.setTag('tenantId', tenantId || 'unknown');
                scope.setTag('branchId', branchId || 'unknown');
                scope.setExtra('url', request.url);
                scope.setExtra('method', request.method);
                Sentry.captureException(exception);
            });
        }

        let message = 'Internal server error';
        let messages: Record<string, string[]> | undefined = undefined;

        if (exception instanceof HttpException) {
            const res = exception.getResponse();
            if (typeof res === 'object' && (res as any).message) {
                if (Array.isArray((res as any).message)) {
                    // Flatten NestJS validation errors into the requested format
                    message = 'Validation Failed';
                    const validationMessages: Record<string, string[]> = {};
                    (res as any).message.forEach((msg: string) => {
                        const field = msg.split(' ')[0];
                        if (!validationMessages[field]) {
                            validationMessages[field] = [];
                        }
                        validationMessages[field].push(msg);
                    });
                    messages = validationMessages;
                } else {
                    message = (res as any).message;
                }
            } else if (typeof res === 'string') {
                message = res;
            }
        } else {
            console.error('Unhandled Exception:', exception);
        }

        const errorResponse = {
            status: false,
            code: status,
            message: message,
            data: null,
        };

        if (status === 422 || (status === 400 && messages)) {
            (errorResponse as any).code = 422; // Force 422 if we have validation messages
            (errorResponse as any).messages = messages;
        }

        response.status(status === 400 && messages ? 422 : status).json(errorResponse);
    }
}
