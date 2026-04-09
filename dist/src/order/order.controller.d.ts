import { OrderService } from './order.service';
import { RefundService } from './refund.service';
import { InvoiceService } from './invoice.service';
import type { Response } from 'express';
import { CreateOrderDto, SplitBillDto, SendReceiptDto } from './dto/order.dto';
export declare class OrderController {
    private readonly orderService;
    private readonly refundService;
    private readonly invoiceService;
    constructor(orderService: OrderService, refundService: RefundService, invoiceService: InvoiceService);
    getOrderInvoice(id: string, res: Response): Promise<void>;
    create(req: any, dto: CreateOrderDto): Promise<{
        jobId: import("bull").JobId;
        status: string;
    }>;
    findAll(start?: string, end?: string, status?: string, limit?: string): Promise<({
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
            status: import(".prisma/client").$Enums.OrderItemStatus;
            price: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        userId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
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
        scheduledAt: Date | null;
        isPreOrder: boolean;
    })[]>;
    lookupByReceipt(receiptNumber: string, date: string, branchId?: string): Promise<{
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
            status: import(".prisma/client").$Enums.OrderItemStatus;
            price: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        userId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
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
        scheduledAt: Date | null;
        isPreOrder: boolean;
    }>;
    createDirect(req: any, dto: CreateOrderDto): Promise<any>;
    updateStatus(id: string, body: {
        status: string;
        paymentMethod?: string;
        paidAmount?: number;
    }): Promise<{
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
            status: import(".prisma/client").$Enums.OrderItemStatus;
            price: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        userId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
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
        scheduledAt: Date | null;
        isPreOrder: boolean;
    }>;
    assignTable(id: string, body: {
        tableId: string;
    }): Promise<any>;
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
            status: import(".prisma/client").$Enums.OrderItemStatus;
            price: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        userId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
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
        scheduledAt: Date | null;
        isPreOrder: boolean;
    }>;
    split(dto: SplitBillDto): Promise<any[]>;
    findOne(id: string): Promise<{
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
            status: import(".prisma/client").$Enums.OrderItemStatus;
            price: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        userId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
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
        scheduledAt: Date | null;
        isPreOrder: boolean;
    }>;
    refundOrder(id: string, body: {
        reason?: string;
    }): Promise<any>;
    refundItem(id: string, itemId: string, body: {
        quantity: number;
        reason?: string;
    }): Promise<any>;
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
            status: import(".prisma/client").$Enums.OrderItemStatus;
            price: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        userId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
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
        scheduledAt: Date | null;
        isPreOrder: boolean;
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
            status: import(".prisma/client").$Enums.OrderItemStatus;
            price: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        userId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        customerId: string | null;
        tableId: string | null;
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
        scheduledAt: Date | null;
        isPreOrder: boolean;
    }>;
    voidOrder(id: string, body: {
        managerPin: string;
    }): Promise<any>;
    voidItem(id: string, itemId: string): Promise<any>;
    repeatOrder(id: string): Promise<any>;
    sendReceipt(id: string, dto: SendReceiptDto): Promise<{
        success: boolean;
    }>;
}
