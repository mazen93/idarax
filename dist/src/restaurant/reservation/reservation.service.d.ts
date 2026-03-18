import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
export declare class ReservationService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    private get context();
    create(dto: any): Promise<any>;
    findAll(): Promise<any>;
    update(id: string, dto: any): Promise<any>;
    remove(id: string): Promise<any>;
}
export declare class WaitingService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    private get context();
    create(dto: any): Promise<any>;
    findAll(): Promise<any>;
    update(id: string, dto: any): Promise<any>;
    remove(id: string): Promise<any>;
}
