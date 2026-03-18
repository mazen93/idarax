import { PublicService } from './public.service';
import { CreatePublicOrderDto } from './dto/public.dto';
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    getTenant(id: string): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.TenantType;
        logoUrl: string | null | undefined;
        currency: string;
        taxRate: import("@prisma/client-runtime-utils").Decimal | null | undefined;
        serviceFee: import("@prisma/client-runtime-utils").Decimal | null | undefined;
        aboutUsText: string | null | undefined;
        bannerImageUrl: string | null | undefined;
        facebookUrl: string | null | undefined;
        instagramUrl: string | null | undefined;
        twitterUrl: string | null | undefined;
        contactEmail: string | null | undefined;
        contactPhone: string | null | undefined;
    }>;
    getBranches(id: string): Promise<{
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
    }[]>;
    getMenu(tenantId: string, branchId?: string): Promise<{
        products: {
            id: string;
            name: string;
            nameAr: string | null;
            description: string | null;
            descriptionAr: string | null;
            price: number;
            costPrice: number;
            variants: {
                id: string;
                name: string;
                price: import("@prisma/client-runtime-utils").Decimal | null;
                sku: string | null;
                costPrice: import("@prisma/client-runtime-utils").Decimal;
                productId: string;
            }[];
        }[];
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultStationId: string | null;
    }[]>;
    createOrder(tenantId: string, dto: CreatePublicOrderDto): Promise<any>;
    generateQr(tenantId: string, tableId: string): Promise<{
        tableNumber: any;
        deepLink: string;
        qrCodeDataUrl: string;
    }>;
    createFeedback(id: string, dto: {
        rating: number;
        comment?: string;
    }): Promise<any>;
}
