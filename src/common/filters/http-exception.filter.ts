import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

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
