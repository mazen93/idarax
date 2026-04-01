import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class TenantCacheInterceptor extends CacheInterceptor {
    trackBy(context: ExecutionContext): string | undefined {
        const req = context.switchToHttp().getRequest();
        const tenantId = req.headers['x-tenant-id'] || 'system';
        const branchId = req.headers['x-branch-id'] || 'all';
        
        // Append query parameters, tenant, and branch strictly to ensure 
        // completely isolated cache buckets per tenant and branch.
        return `${tenantId}-${branchId}-${req.method}-${req.url}`;
    }
}
