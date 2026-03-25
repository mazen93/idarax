import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { UpdateSettingsDto } from './dto/settings.dto';
export declare class SettingsService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    get(): Promise<{
        tenant: {
            id: string;
            createdAt: Date;
            name: string;
            domain: string | null;
            type: import(".prisma/client").$Enums.TenantType;
            updatedAt: Date;
        };
    } & {
        id: string;
        tenantId: string;
        currency: string;
        timezone: string;
        logoUrl: string | null;
        receiptFooter: string | null;
        receiptHeader: string | null;
        serviceFee: import("@prisma/client/runtime/library").Decimal | null;
        taxRate: import("@prisma/client/runtime/library").Decimal | null;
        receiptFontSize: number;
        receiptQrCodeUrl: string | null;
        receiptShowCustomer: boolean;
        receiptShowLogo: boolean;
        receiptShowOrderNumber: boolean;
        receiptShowTable: boolean;
        aboutUsText: string | null;
        bannerImageUrl: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        facebookUrl: string | null;
        instagramUrl: string | null;
        receiptLanguage: string;
        receiptShowBarcode: boolean;
        receiptShowDiscount: boolean;
        receiptShowItemsDescription: boolean;
        receiptShowItemsPrice: boolean;
        receiptShowItemsQty: boolean;
        receiptShowOperator: boolean;
        receiptShowOrderType: boolean;
        receiptShowPaymentMethod: boolean;
        receiptShowServiceCharge: boolean;
        receiptShowSubtotal: boolean;
        receiptShowTax: boolean;
        receiptShowTimestamp: boolean;
        receiptShowTotal: boolean;
        twitterUrl: string | null;
    }>;
    update(dto: UpdateSettingsDto): Promise<any>;
}
