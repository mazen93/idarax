import { PublicService } from './public.service';
import { CreatePublicOrderDto } from './dto/public.dto';
import { SplitBillDto } from '../order/dto/order.dto';
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    getTenant(id: string): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.TenantType;
        logoUrl: string | null | undefined;
        currency: string;
        taxRate: import("@prisma/client/runtime/library").Decimal | null | undefined;
        serviceFee: import("@prisma/client/runtime/library").Decimal | null | undefined;
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
        tenant: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.TenantType;
            logoUrl: string | null | undefined;
            currency: string;
            taxRate: import("@prisma/client/runtime/library").Decimal | null | undefined;
            serviceFee: import("@prisma/client/runtime/library").Decimal | null | undefined;
            aboutUsText: string | null | undefined;
            bannerImageUrl: string | null | undefined;
            facebookUrl: string | null | undefined;
            instagramUrl: string | null | undefined;
            twitterUrl: string | null | undefined;
            contactEmail: string | null | undefined;
            contactPhone: string | null | undefined;
        };
        categories: {
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
                    price: import("@prisma/client/runtime/library").Decimal | null;
                    sku: string | null;
                    costPrice: import("@prisma/client/runtime/library").Decimal;
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
            defaultPrepTime: number;
            defaultStationId: string | null;
        }[];
    }>;
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
    getTableOrder(tableId: string): Promise<any>;
    getTable(id: string): Promise<{
        id: any;
        number: any;
        branchId: any;
    }>;
    splitOrder(id: string, dto: SplitBillDto): Promise<any[]>;
}
