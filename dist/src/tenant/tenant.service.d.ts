export declare class TenantService {
    private readonly als;
    setContext(tenantId: string, branchId?: string): void;
    setTenantId(tenantId: string): void;
    setBranchId(branchId: string): void;
    getTenantId(): string | undefined;
    getBranchId(): string | undefined;
}
