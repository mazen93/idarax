"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const Sentry = __importStar(require("@sentry/nestjs"));
const tenant_service_1 = require("../../tenant/tenant.service");
let HttpExceptionFilter = class HttpExceptionFilter {
    tenantService;
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();
        if (status >= 500 || !(exception instanceof common_1.HttpException)) {
            Sentry.withScope((scope) => {
                scope.setTag('tenantId', tenantId || 'unknown');
                scope.setTag('branchId', branchId || 'unknown');
                scope.setExtra('url', request.url);
                scope.setExtra('method', request.method);
                Sentry.captureException(exception);
            });
        }
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
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map