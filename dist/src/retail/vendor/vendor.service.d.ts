import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
export declare class VendorService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateVendorDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        email: string | null;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
    }[]>;
    update(id: string, dto: UpdateVendorDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
    }>;
    linkProduct(vendorId: string, dto: {
        productId: string;
        costPrice: number;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        productId: string;
        vendorId: string;
    }>;
    unlinkProduct(vendorId: string, productId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        productId: string;
        vendorId: string;
    }>;
    getProducts(vendorId: string): Promise<any>;
    getPurchaseHistory(vendorId: string): Promise<any>;
    getSpendAnalytics(vendorId: string): Promise<{
        totalSpent: any;
        orderCount: any;
    }>;
}
