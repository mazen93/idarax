import { VendorService } from './vendor.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
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
    linkProduct(id: string, dto: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        productId: string;
        vendorId: string;
    }>;
    unlinkProduct(id: string, productId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
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
