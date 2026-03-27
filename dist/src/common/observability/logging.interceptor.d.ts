import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantService } from '../../tenant/tenant.service';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly tenantService;
    private readonly logger;
    constructor(tenantService: TenantService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
