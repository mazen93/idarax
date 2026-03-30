import { PublicService } from './public.service';
import { CreatePublicOrderDto } from './dto/public.dto';
import { SplitBillDto } from '../order/dto/order.dto';
import { InvoiceService } from '../order/invoice.service';
import type { Response } from 'express';
export declare class PublicController {
    private readonly publicService;
    private readonly invoiceService;
    constructor(publicService: PublicService, invoiceService: InvoiceService);
    getOrderInvoice(id: string, res: Response): Promise<void>;
    getPublicOrder(id: string): Promise<any>;
    getTenant(id: string): Promise<{
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
    getBranches(id: string): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
    }[]>;
    getMenu(tenantId: string, branchId?: string): Promise<{
        tenant: {
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
