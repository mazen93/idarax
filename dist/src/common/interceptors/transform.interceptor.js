"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        return next.handle().pipe((0, operators_1.map)((data) => {
            let responseData = data;
            let meta = undefined;
            if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
                responseData = data.data;
                meta = {
                    current_page: data.meta.page || data.meta.current_page,
                    last_page: data.meta.lastPage || data.meta.last_page,
                    per_page: data.meta.limit || data.meta.per_page,
                    total: data.meta.total,
                };
            }
            return {
                status: statusCode >= 200 && statusCode < 300,
                code: statusCode,
                message: 'Operation successful',
                data: responseData,
                meta: meta,
            };
        }));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
//# sourceMappingURL=transform.interceptor.js.map