import { VendorService } from './vendor.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
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
    linkProduct(id: string, dto: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        productId: string;
        vendorId: string;
    }>;
    unlinkProduct(id: string, productId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        productId: string;
        vendorId: string;
    }>;
    getProducts(id: string): Promise<({
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
