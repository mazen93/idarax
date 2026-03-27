"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const tenant_service_1 = require("../../tenant/tenant.service");
const core_1 = require("@nestjs/core");
const logging_interceptor_1 = require("./logging.interceptor");
const config_1 = require("@nestjs/config");
let ObservabilityModule = class ObservabilityModule {
};
exports.ObservabilityModule = ObservabilityModule;
exports.ObservabilityModule = ObservabilityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService, tenant_service_1.TenantService],
                useFactory: (config, tenantService) => ({
                    pinoHttp: {
                        level: config.get('LOG_LEVEL', 'info'),
                        transport: config.get('NODE_ENV') !== 'production'
                            ? { target: 'pino-pretty', options: { colorize: true } }
                            : undefined,
                        customProps: (req, res) => {
                            return {
                                tenantId: tenantService.getTenantId(),
                                branchId: tenantService.getBranchId(),
                                requestId: req.headers['x-request-id'],
                            };
                        },
                        autoLogging: false,
                        serializers: {
                            req: (req) => ({
                                id: req.id,
                                method: req.method,
                                url: req.url,
                            }),
                        },
                    },
                }),
            }),
            nestjs_prometheus_1.PrometheusModule.register({
                path: '/metrics',
                defaultMetrics: {
                    enabled: true,
                },
            }),
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
        ],
    })
], ObservabilityModule);
//# sourceMappingURL=observability.module.js.map