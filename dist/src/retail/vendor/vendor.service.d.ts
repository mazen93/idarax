import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
export declare class VendorService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateVendorDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
        email: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
        email: string | null;
    }[]>;
    update(id: string, dto: UpdateVendorDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
        email: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
        email: string | null;
    }>;
    linkProduct(vendorId: string, dto: {
        productId: string;
        costPrice: number;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        productId: string;
        vendorId: string;
    }>;
    unlinkProduct(vendorId: string, productId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        productId: string;
        vendorId: string;
    }>;
    getProducts(vendorId: string): Promise<({
        product: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            description: string | null;
            descriptionAr: string | null;
            defaultStationId: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            sku: string | null;
            barcode: string | null;
            costPrice: import("@prisma/client-runtime-utils").Decimal;
            isSellable: boolean;
            productType: import("@prisma/client").$Enums.ProductType;
            categoryId: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        productId: string;
        vendorId: string;
    })[]>;
}
