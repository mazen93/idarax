"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const tenant_service_1 = require("../../tenant/tenant.service");
const uuid_1 = require("uuid");
let LoggingInterceptor = class LoggingInterceptor {
    tenantService;
    logger = new common_1.Logger('HTTP');
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, headers } = request;
        const startTime = Date.now();
        const requestId = headers['x-request-id'] || (0, uuid_1.v4)();
        request.headers['x-request-id'] = requestId;
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const responseTime = Date.now() - startTime;
                const statusCode = context.switchToHttp().getResponse().statusCode;
                this.logger.log({
                    message: `Request completed: ${method} ${url}`,
                    method,
                    url,
                    statusCode,
                    responseTime,
                    requestId,
                    tenantId,
                    branchId,
                });
            },
            error: (err) => {
                const responseTime = Date.now() - startTime;
                const statusCode = err.status || 500;
                this.logger.error({
                    message: `Request failed: ${method} ${url}`,
                    method,
                    url,
                    statusCode,
                    responseTime,
                    requestId,
                    tenantId,
                    branchId,
                    error: err.message,
                });
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map