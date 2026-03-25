import { OrderService } from './order.service';
import { RefundService } from './refund.service';
import { CreateOrderDto, SplitBillDto, SendReceiptDto } from './dto/order.dto';
export declare class OrderController {
    private readonly orderService;
    private readonly refundService;
    constructor(orderService: OrderService, refundService: RefundService);
    create(req: any, dto: CreateOrderDto): Promise<{
        jobId: import("bull").JobId;
        status: string;
    }>;
    findAll(start?: string, end?: string): Promise<({
        user: {
            name: string;
        } | null;
        table: {
            number: number;
        } | null;
        customer: {
            name: string;
            phone: string | null;
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
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    variantId: string | null;
                    parentId: string;
                    ingredientId: string;
                    unit: string;
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
            productId: string;
            note: string | null;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
            fireAt: Date | null;
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
        source: import(".prisma/client").$Enums.OrderSource;
        externalPlatform: string | null;
        externalOrderId: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
    })[]>;
    lookupByReceipt(receiptNumber: string, date: string, branchId?: string): Promise<{
        user: {
            name: string;
        } | null;
        table: {
            number: number;
        } | null;
        customer: {
            name: string;
            phone: string | null;
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
            productId: string;
            note: string | null;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
            fireAt: Date | null;
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
        source: import(".prisma/client").$Enums.OrderSource;
        externalPlatform: string | null;
        externalOrderId: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
    }>;
    createDirect(req: any, dto: CreateOrderDto): Promise<any>;
    updateStatus(id: string, body: {
        status: string;
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
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            productId: string;
            note: string | null;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
            fireAt: Date | null;
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
        source: import(".prisma/client").$Enums.OrderSource;
        externalPlatform: string | null;
        externalOrderId: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
    }>;
    assignTable(id: string, body: {
        tableId: string;
    }): Promise<any>;
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
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    variantId: string | null;
                    parentId: string;
                    ingredientId: string;
                    unit: string;
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
            productId: string;
            note: string | null;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
            fireAt: Date | null;
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
        source: import(".prisma/client").$Enums.OrderSource;
        externalPlatform: string | null;
        externalOrderId: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
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
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    variantId: string | null;
                    parentId: string;
                    ingredientId: string;
                    unit: string;
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
            productId: string;
            note: string | null;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
            fireAt: Date | null;
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
        source: import(".prisma/client").$Enums.OrderSource;
        externalPlatform: string | null;
        externalOrderId: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
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
            price: import("@prisma/client/runtime/library").Decimal;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            productId: string;
            note: string | null;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
            fireAt: Date | null;
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
        source: import(".prisma/client").$Enums.OrderSource;
        externalPlatform: string | null;
        externalOrderId: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
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
            productId: string;
            note: string | null;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
            fireAt: Date | null;
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
        source: import(".prisma/client").$Enums.OrderSource;
        externalPlatform: string | null;
        externalOrderId: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
    }>;
    voidOrder(id: string): Promise<{
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
            productId: string;
            note: string | null;
            quantity: number;
            orderId: string;
            stationId: string | null;
            courseName: string | null;
            variantId: string | null;
            startedAt: Date | null;
            completedAt: Date | null;
            fireAt: Date | null;
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
        source: import(".prisma/client").$Enums.OrderSource;
        externalPlatform: string | null;
        externalOrderId: string | null;
        isSplit: boolean;
        parentOrderId: string | null;
    }>;
    voidItem(id: string, itemId: string): Promise<any>;
    repeatOrder(id: string): Promise<any>;
    sendReceipt(id: string, dto: SendReceiptDto): Promise<{
        success: boolean;
    }>;
}
