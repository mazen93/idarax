import { VendorService } from './vendor.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    create(dto: CreateVendorDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        tenantId: string;
        nameAr: string | null;
        address: string | null;
        phone: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        tenantId: string;
        nameAr: string | null;
        address: string | null;
        phone: string | null;
    }[]>;
    update(id: string, dto: UpdateVendorDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        tenantId: string;
        nameAr: string | null;
        address: string | null;
        phone: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        tenantId: string;
        nameAr: string | null;
        address: string | null;
        phone: string | null;
    }>;
    linkProduct(id: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        productId: string;
        vendorId: string;
    }>;
    unlinkProduct(id: string, productId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        productId: string;
        vendorId: string;
    }>;
    getProducts(id: string): Promise<any>;
    getHistory(id: string): Promise<any>;
    getAnalytics(id: string): Promise<{
        totalSpent: any;
        orderCount: any;
    }>;
}
