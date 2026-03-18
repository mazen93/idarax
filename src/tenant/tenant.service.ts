import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TenantService {
    private readonly als = new AsyncLocalStorage<{ tenantId: string, branchId?: string }>();

    setContext(tenantId: string, branchId?: string) {
        this.als.enterWith({ tenantId, branchId });
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

    getTenantId(): string | undefined {
        return this.als.getStore()?.tenantId;
    }

    getBranchId(): string | undefined {
        return this.als.getStore()?.branchId;
    }
}
