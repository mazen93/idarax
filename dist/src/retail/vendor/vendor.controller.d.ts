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
        phone: string | null;
        email: string | null;
        address: string | null;
        nameAr: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        address: string | null;
        nameAr: string | null;
    }[]>;
    update(id: string, dto: UpdateVendorDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        address: string | null;
        nameAr: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        address: string | null;
        nameAr: string | null;
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
            price: import("@prisma/client/runtime/library").Decimal;
            sku: string | null;
            barcode: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            isSellable: boolean;
            productType: import(".prisma/client").$Enums.ProductType;
            prepTime: number;
            unit: string | null;
            categoryId: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        productId: string;
        vendorId: string;
    })[]>;
}
