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
    findAll(startDate?: Date, endDate?: Date, status?: string, limit?: number): Promise<({
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
                    name: string;
                    createdAt: Date;
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
                name: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                description: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
                defaultStationId: string | null;
                imageUrl: string | null;
                sku: string | null;
                barcode: string | null;
                categoryId: string;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                isSellable: boolean;
                productType: import(".prisma/client").$Enums.ProductType;
                prepTime: number;
                unit: string | null;
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
            fireAt: Date | null;
            startedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        userId: string | null;
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
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        loyaltyPointsUsed: number;
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
            fireAt: Date | null;
            startedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        userId: string | null;
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
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        loyaltyPointsUsed: number;
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
                    name: string;
                    createdAt: Date;
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
                name: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                description: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
                defaultStationId: string | null;
                imageUrl: string | null;
                sku: string | null;
                barcode: string | null;
                categoryId: string;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                isSellable: boolean;
                productType: import(".prisma/client").$Enums.ProductType;
                prepTime: number;
                unit: string | null;
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
            fireAt: Date | null;
            startedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        userId: string | null;
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
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        loyaltyPointsUsed: number;
    }>;
    findActiveByTable(tableId: string): Promise<{
        items: ({
            modifiers: ({
                option: {
                    id: string;
                    name: string;
                    createdAt: Date;
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
                name: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                description: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
                defaultStationId: string | null;
                imageUrl: string | null;
                sku: string | null;
                barcode: string | null;
                categoryId: string;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                isSellable: boolean;
                productType: import(".prisma/client").$Enums.ProductType;
                prepTime: number;
                unit: string | null;
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
            fireAt: Date | null;
            startedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        userId: string | null;
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
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        loyaltyPointsUsed: number;
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
            fireAt: Date | null;
            startedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        userId: string | null;
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
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        loyaltyPointsUsed: number;
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
            fireAt: Date | null;
            startedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        userId: string | null;
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
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        loyaltyPointsUsed: number;
    }>;
    voidOrder(id: string, managerPin: string): Promise<any>;
    private restoreStockRecursively;
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
                    name: string;
                    createdAt: Date;
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
            fireAt: Date | null;
            startedAt: Date | null;
            isReward: boolean;
            pointsCost: number;
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
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        userId: string | null;
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
        externalOrderId: string | null;
        externalPlatform: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
        source: import(".prisma/client").$Enums.OrderSource;
        loyaltyCashback: import("@prisma/client/runtime/library").Decimal;
        loyaltyPointsUsed: number;
    }>;
    sendReceipt(orderId: string, email: string): Promise<{
        success: boolean;
    }>;
    private generateReceiptHtml;
}
