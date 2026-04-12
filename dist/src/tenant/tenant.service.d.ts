export declare class TenantService {
    private readonly als;
    setContext(tenantId: string, branchId?: string, tenantType?: string): void;
    setTenantId(tenantId: string): void;
    setBranchId(branchId: string): void;
    setTenantType(tenantType: string): void;
    getTenantId(): string | undefined;
    getBranchId(): string | undefined;
    getTenantType(): string | undefined;
    isRetail(): boolean;
    isRestaurant(): boolean;
}
