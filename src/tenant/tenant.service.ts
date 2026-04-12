import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TenantService {
    private readonly als = new AsyncLocalStorage<{ tenantId: string, branchId?: string, tenantType?: string }>();

    setContext(tenantId: string, branchId?: string, tenantType?: string) {
        this.als.enterWith({ tenantId, branchId, tenantType });
    }

    setTenantId(tenantId: string) {
        const store = this.als.getStore();
        this.als.enterWith({ ...store, tenantId });
    }

    setBranchId(branchId: string) {
        const store = this.als.getStore();
        if (store) {
            this.als.enterWith({ ...store, branchId });
        }
    }

    setTenantType(tenantType: string) {
        const store = this.als.getStore();
        if (store) {
            this.als.enterWith({ ...store, tenantType });
        }
    }

    getTenantId(): string | undefined {
        return this.als.getStore()?.tenantId;
    }

    getBranchId(): string | undefined {
        return this.als.getStore()?.branchId;
    }

    getTenantType(): string | undefined {
        return this.als.getStore()?.tenantType;
    }

    isRetail(): boolean {
        return this.getTenantType() === 'RETAIL';
    }

    isRestaurant(): boolean {
        const type = this.getTenantType();
        return type === 'RESTAURANT' || type === 'CAFE' || !type; // Default to restaurant if not specified
    }
}
