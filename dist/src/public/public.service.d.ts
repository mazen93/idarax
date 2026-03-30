import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicOrderDto } from './dto/public.dto';
import { SplitBillDto } from '../order/dto/order.dto';
import { NumberingService } from '../order/numbering.service';
export declare class PublicService {
    private prisma;
    private numberingService;
    constructor(prisma: PrismaService, numberingService: NumberingService);
    getTenantBranding(tenantIdOrDomain: string): Promise<{
        id: any;
        name: any;
        type: any;
        logoUrl: any;
        currency: any;
        taxRate: any;
        serviceFee: any;
        aboutUsText: any;
        bannerImageUrl: any;
        facebookUrl: any;
        instagramUrl: any;
        twitterUrl: any;
        contactEmail: any;
        contactPhone: any;
    }>;
    getBranches(tenantIdOrDomain: string): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
    }[]>;
    getMenu(tenantIdOrDomain: string, branchId?: string): Promise<{
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
            modifiers: ({
                options: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    nameAr: string | null;
                    sortOrder: number;
                    priceAdjust: import("@prisma/client/runtime/library").Decimal;
                    modifierId: string;
                }[];
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                productId: string;
                required: boolean;
                multiSelect: boolean;
                sortOrder: number;
            })[];
        }[];
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
        imageUrl: string | null;
    }[]>;
    createGuestOrder(tenantIdOrDomain: string, dto: CreatePublicOrderDto): Promise<any>;
    generateTableQr(tenantIdOrDomain: string, tableId: string): Promise<{
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
    getPublicOrder(id: string): Promise<any>;
}
