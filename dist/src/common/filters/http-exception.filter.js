"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let messages = undefined;
        if (exception instanceof common_1.HttpException) {
            const res = exception.getResponse();
            if (typeof res === 'object' && res.message) {
                if (Array.isArray(res.message)) {
                    message = 'Validation Failed';
                    const validationMessages = {};
                    res.message.forEach((msg) => {
                        const field = msg.split(' ')[0];
                        if (!validationMessages[field]) {
                            validationMessages[field] = [];
                        }
                        validationMessages[field].push(msg);
                    });
                    messages = validationMessages;
                }
                else {
                    message = res.message;
                }
            }
            else if (typeof res === 'string') {
                message = res;
            }
        }
        else {
            console.error('Unhandled Exception:', exception);
        }
        const errorResponse = {
            status: false,
            code: status,
            message: message,
            data: null,
        };
        if (status === 422 || (status === 400 && messages)) {
            errorResponse.code = 422;
            errorResponse.messages = messages;
        }
        response.status(status === 400 && messages ? 422 : status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map