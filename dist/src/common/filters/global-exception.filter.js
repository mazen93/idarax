"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'An unexpected error occurred';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const body = exception.getResponse();
            if (typeof body === 'string') {
                message = body;
            }
            else if (typeof body === 'object' && body !== null) {
                const bodyObj = body;
                if (Array.isArray(bodyObj.message)) {
                    message = bodyObj.message.join('; ');
                }
                else {
                    message = bodyObj.message ?? message;
                }
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002': {
                    const fields = exception.meta?.target?.join(', ') ?? 'field';
                    message = `A record with this ${fields} already exists`;
                    status = common_1.HttpStatus.CONFLICT;
                    break;
                }
                case 'P2025':
                    message = exception.meta?.cause ?? 'Record not found';
                    status = common_1.HttpStatus.NOT_FOUND;
                    break;
                case 'P2003':
                    message = 'Related record not found (foreign key constraint failed)';
                    status = common_1.HttpStatus.BAD_REQUEST;
                    break;
                case 'P2014':
                    message = 'Invalid relation — violates required constraint';
                    status = common_1.HttpStatus.BAD_REQUEST;
                    break;
                default:
                    message = `Database error: ${exception.code}`;
                    status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            message = 'Invalid data provided to the database';
            status = common_1.HttpStatus.BAD_REQUEST;
        }
        else if (exception instanceof Error) {
            message = exception.message || message;
        }
        if (status >= 500) {
            this.logger.error(`[${request.method}] ${request.url} → ${status}`, exception instanceof Error ? exception.stack : String(exception));
        }
        else {
            this.logger.warn(`[${request.method}] ${request.url} → ${status}: ${message}`);
        }
        response.status(status).json({
            status: false,
            code: status,
            message,
            data: null,
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map