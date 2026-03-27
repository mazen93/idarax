import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { TenantService } from '../../tenant/tenant.service';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
