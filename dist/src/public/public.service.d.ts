import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicOrderDto } from './dto/public.dto';
import { SplitBillDto } from '../order/dto/order.dto';
export declare class PublicService {
    private prisma;
    constructor(prisma: PrismaService);
    getTenantBranding(tenantId: string): Promise<{
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
    getBranches(tenantId: string): Promise<{
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
                price: import("@prisma/client/runtime/library").Decimal | null;
                sku: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                productId: string;
            }[];
        }[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
    }[]>;
    createGuestOrder(tenantId: string, dto: CreatePublicOrderDto): Promise<any>;
    generateTableQr(tenantId: string, tableId: string): Promise<{
        tableNumber: any;
        deepLink: string;
        qrCodeDataUrl: string;
    }>;
    createOrderFeedback(orderId: string, dto: {
        rating: number;
        comment?: string;
    }): Promise<any>;
    getTableOrder(tableId: string): Promise<any>;
    getTable(id: string): Promise<{
        id: any;
        number: any;
        branchId: any;
    }>;
    splitOrder(orderId: string, dto: SplitBillDto): Promise<any[]>;
}
