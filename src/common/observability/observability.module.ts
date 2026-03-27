import { Module, Global } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TenantService } from '../../tenant/tenant.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, TenantService],
      useFactory: (config: ConfigService, tenantService: TenantService) => ({
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
          autoLogging: false, // We will use our own interceptor for better control
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
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class ObservabilityModule {}
