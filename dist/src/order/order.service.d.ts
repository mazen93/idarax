import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import type { Queue } from 'bull';
import { CreateOrderDto, SplitBillDto, RepeatOrderDto } from './dto/order.dto';
import { OfferService } from '../retail/offer/offer.service';
import { DrawerService } from '../staff/drawer.service';
import { NumberingService } from './numbering.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CrmService } from '../crm/crm.service';
import { KdsGateway } from '../restaurant/kds/kds.gateway';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DrovoService } from '../delivery-aggregator/drovo.service';
export declare class OrderService {
    private prisma;
    private tenantService;
    private offerService;
    private numberingService;
    private mailService;
    private orderQueue;
    private drawerService?;
    private auditLog?;
    private analyticsService?;
    private crmService?;
    private kdsGateway?;
    private notificationsService?;
    private drovoService?;
    constructor(prisma: PrismaService, tenantService: TenantService, offerService: OfferService, numberingService: NumberingService, mailService: MailService, orderQueue: Queue, drawerService?: DrawerService | undefined, auditLog?: AuditLogService | undefined, analyticsService?: AnalyticsService | undefined, crmService?: CrmService | undefined, kdsGateway?: KdsGateway | undefined, notificationsService?: NotificationsService | undefined, drovoService?: DrovoService | undefined);
    private get db();
    createAsync(dto: CreateOrderDto, userId?: string): Promise<{
        jobId: import("bull").JobId;
        status: string;
    }>;
    createDirect(dto: CreateOrderDto & {
        userId?: string;
        orderType?: string;
        paymentMethod?: string;
        note?: string;
        paidAmount?: number;
        splitPayments?: {
            method: string;
            amount: number;
        }[];
    }): Promise<any>;
    private resolveStationIds;
    private calculateBOMCost;
    private calculateFireTimes;
    private deductStockRecursively;
    findAll(startDate?: Date, endDate?: Date): Promise<({
        user: {
            name: string;
        } | null;
        customer: {
            name: string;
            phone: string | null;
        } | null;
        table: {
            number: number;
        } | null;
        items: ({
            modifiers: ({
                option: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    updatedAt: Date;
                    nameAr: string | null;
                    sortOrder: number;
                    priceAdjust: import("@prisma/client/runtime/library").Decimal;
                    modifierId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                optionId: string;
                itemId: string;
            })[];
            product: {
                category: {
                    name: string;
                };
                usedInRecipes: ({
                    ingredient: {
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    unit: string;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    variantId: string | null;
                    parentId: string;
                    ingredientId: string;
                })[];
            } & {
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
            variant: {
                name: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            note: string | null;
            productId: string;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            completedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
            fireAt: Date | null;
            startedAt: Date | null;
        })[];
    } & {
        id: string;
        userId: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
        note: string | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        guestName: string | null;
        guestPhone: string | null;
        deliveryAddress: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal | null;
        invoiceNumber: string | null;
        offerCode: string | null;
        receiptNumber: number | null;
        serviceFeeAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        orderType: import(".prisma/client").$Enums.OrderType;
        deliveryFee: import("@prisma/client/runtime/library").Decimal | null;
        loyaltyPointsUsed: number;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
    })[]>;
    updateStatus(id: string, status: string): Promise<{
        table: {
            number: number;
        } | null;
        items: ({
            product: {
                name: string;
            };
            variant: {
                name: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            note: string | null;
            productId: string;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            completedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
            fireAt: Date | null;
            startedAt: Date | null;
        })[];
    } & {
        id: string;
        userId: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
        note: string | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        guestName: string | null;
        guestPhone: string | null;
        deliveryAddress: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal | null;
        invoiceNumber: string | null;
        offerCode: string | null;
        receiptNumber: number | null;
        serviceFeeAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        orderType: import(".prisma/client").$Enums.OrderType;
        deliveryFee: import("@prisma/client/runtime/library").Decimal | null;
        loyaltyPointsUsed: number;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
    }>;
    assignTable(id: string, tableId: string): Promise<any>;
    splitBill(dto: SplitBillDto): Promise<any[]>;
    getOrder(id: string): Promise<{
        user: {
            name: string;
        } | null;
        items: ({
            modifiers: ({
                option: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    updatedAt: Date;
                    nameAr: string | null;
                    sortOrder: number;
                    priceAdjust: import("@prisma/client/runtime/library").Decimal;
                    modifierId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                optionId: string;
                itemId: string;
            })[];
            product: {
                usedInRecipes: ({
                    ingredient: {
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    unit: string;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    variantId: string | null;
                    parentId: string;
                    ingredientId: string;
                })[];
            } & {
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
            variant: {
                id: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal | null;
                sku: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                productId: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            note: string | null;
            productId: string;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            completedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
            fireAt: Date | null;
            startedAt: Date | null;
        })[];
    } & {
        id: string;
        userId: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
        note: string | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        guestName: string | null;
        guestPhone: string | null;
        deliveryAddress: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal | null;
        invoiceNumber: string | null;
        offerCode: string | null;
        receiptNumber: number | null;
        serviceFeeAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        orderType: import(".prisma/client").$Enums.OrderType;
        deliveryFee: import("@prisma/client/runtime/library").Decimal | null;
        loyaltyPointsUsed: number;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
    }>;
    findActiveByTable(tableId: string): Promise<{
        items: ({
            modifiers: ({
                option: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    updatedAt: Date;
                    nameAr: string | null;
                    sortOrder: number;
                    priceAdjust: import("@prisma/client/runtime/library").Decimal;
                    modifierId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                optionId: string;
                itemId: string;
            })[];
            product: {
                usedInRecipes: ({
                    ingredient: {
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    unit: string;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    variantId: string | null;
                    parentId: string;
                    ingredientId: string;
                })[];
            } & {
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
            variant: {
                id: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal | null;
                sku: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                productId: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            note: string | null;
            productId: string;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            completedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
            fireAt: Date | null;
            startedAt: Date | null;
        })[];
    } & {
        id: string;
        userId: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
        note: string | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        guestName: string | null;
        guestPhone: string | null;
        deliveryAddress: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal | null;
        invoiceNumber: string | null;
        offerCode: string | null;
        receiptNumber: number | null;
        serviceFeeAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        orderType: import(".prisma/client").$Enums.OrderType;
        deliveryFee: import("@prisma/client/runtime/library").Decimal | null;
        loyaltyPointsUsed: number;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
    }>;
    holdOrder(id: string): Promise<{
        table: {
            number: number;
        } | null;
        items: ({
            product: {
                name: string;
            };
            variant: {
                name: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            note: string | null;
            productId: string;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            completedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
            fireAt: Date | null;
            startedAt: Date | null;
        })[];
    } & {
        id: string;
        userId: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
        note: string | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        guestName: string | null;
        guestPhone: string | null;
        deliveryAddress: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal | null;
        invoiceNumber: string | null;
        offerCode: string | null;
        receiptNumber: number | null;
        serviceFeeAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        orderType: import(".prisma/client").$Enums.OrderType;
        deliveryFee: import("@prisma/client/runtime/library").Decimal | null;
        loyaltyPointsUsed: number;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
    }>;
    fireOrder(id: string): Promise<{
        table: {
            number: number;
        } | null;
        items: ({
            product: {
                name: string;
            };
            variant: {
                name: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            note: string | null;
            productId: string;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            completedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
            fireAt: Date | null;
            startedAt: Date | null;
        })[];
    } & {
        id: string;
        userId: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
        note: string | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        guestName: string | null;
        guestPhone: string | null;
        deliveryAddress: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal | null;
        invoiceNumber: string | null;
        offerCode: string | null;
        receiptNumber: number | null;
        serviceFeeAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        orderType: import(".prisma/client").$Enums.OrderType;
        deliveryFee: import("@prisma/client/runtime/library").Decimal | null;
        loyaltyPointsUsed: number;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
    }>;
    voidOrder(id: string, actorId?: string, actorEmail?: string): Promise<{
        table: {
            number: number;
        } | null;
        items: ({
            product: {
                name: string;
            };
            variant: {
                name: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            note: string | null;
            productId: string;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            completedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
            fireAt: Date | null;
            startedAt: Date | null;
        })[];
    } & {
        id: string;
        userId: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
        note: string | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        guestName: string | null;
        guestPhone: string | null;
        deliveryAddress: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal | null;
        invoiceNumber: string | null;
        offerCode: string | null;
        receiptNumber: number | null;
        serviceFeeAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        orderType: import(".prisma/client").$Enums.OrderType;
        deliveryFee: import("@prisma/client/runtime/library").Decimal | null;
        loyaltyPointsUsed: number;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
    }>;
    voidItem(orderId: string, itemId: string, actorId?: string, actorEmail?: string): Promise<any>;
    repeatOrder(dto: RepeatOrderDto): Promise<any>;
    lookupByReceipt(receiptNumber: number, date: string, branchId?: string): Promise<{
        user: {
            name: string;
        } | null;
        customer: {
            name: string;
            phone: string | null;
        } | null;
        table: {
            number: number;
        } | null;
        items: ({
            modifiers: ({
                option: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    updatedAt: Date;
                    nameAr: string | null;
                    sortOrder: number;
                    priceAdjust: import("@prisma/client/runtime/library").Decimal;
                    modifierId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                optionId: string;
                itemId: string;
            })[];
            product: {
                name: string;
            };
            variant: {
                name: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            note: string | null;
            productId: string;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            completedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
            fireAt: Date | null;
            startedAt: Date | null;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            status: string;
            orderId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            method: string;
            reference: string | null;
        }[];
    } & {
        id: string;
        userId: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
        note: string | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        guestName: string | null;
        guestPhone: string | null;
        deliveryAddress: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal | null;
        invoiceNumber: string | null;
        offerCode: string | null;
        receiptNumber: number | null;
        serviceFeeAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        orderType: import(".prisma/client").$Enums.OrderType;
        deliveryFee: import("@prisma/client/runtime/library").Decimal | null;
        loyaltyPointsUsed: number;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
    }>;
    sendReceipt(orderId: string, email: string): Promise<{
        success: boolean;
    }>;
    private generateReceiptHtml;
}
