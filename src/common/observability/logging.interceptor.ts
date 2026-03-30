import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TenantService } from '../../tenant/tenant.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly tenantService: TenantService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Increase max listeners for the response object to handle multiple logging/telemetry layers
    if (typeof response.setMaxListeners === 'function') {
      response.setMaxListeners(20);
    }

    const { method, url, headers } = request;
    const startTime = Date.now();

    // Ensure requestId exists
    const requestId = headers['x-request-id'] || uuidv4();
    request.headers['x-request-id'] = requestId;

    const tenantId = this.tenantService.getTenantId();
    const branchId = this.tenantService.getBranchId();

    return next.handle().pipe(
      tap({
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
      }),
    );
  }
}
