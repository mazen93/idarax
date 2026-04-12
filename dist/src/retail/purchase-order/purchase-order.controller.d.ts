import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto, UpdatePurchaseOrderDto } from './dto/purchase-order.dto';
export declare class PurchaseOrderController {
    private readonly poService;
    constructor(poService: PurchaseOrderService);
    create(dto: CreatePurchaseOrderDto): Promise<{
        items: {
            id: string;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            purchaseOrderId: string;
            receivedQty: number;
        }[];
        vendor: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            tenantId: string;
            nameAr: string | null;
            address: string | null;
            phone: string | null;
        };
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        tenantId: string;
        branchId: string | null;
        note: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        warehouseId: string | null;
        vendorId: string;
        orderedAt: Date | null;
        receivedAt: Date | null;
    }>;
    findAll(): Promise<({
        warehouse: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        } | null;
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                price: import("@prisma/client/runtime/library").Decimal;
                description: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
                imageUrl: string | null;
                defaultStationId: string | null;
                sku: string | null;
                barcode: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                isSellable: boolean;
                productType: import(".prisma/client").$Enums.ProductType;
                prepTime: number;
                unit: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            purchaseOrderId: string;
            receivedQty: number;
        })[];
        vendor: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            tenantId: string;
            nameAr: string | null;
            address: string | null;
            phone: string | null;
        };
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        tenantId: string;
        branchId: string | null;
        note: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        warehouseId: string | null;
        vendorId: string;
        orderedAt: Date | null;
        receivedAt: Date | null;
    })[]>;
    update(id: string, dto: UpdatePurchaseOrderDto): Promise<{
        warehouse: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        } | null;
        items: {
            id: string;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            purchaseOrderId: string;
            receivedQty: number;
        }[];
        vendor: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            tenantId: string;
            nameAr: string | null;
            address: string | null;
            phone: string | null;
        };
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        tenantId: string;
        branchId: string | null;
        note: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        warehouseId: string | null;
        vendorId: string;
        orderedAt: Date | null;
        receivedAt: Date | null;
    }>;
    updateStatus(id: string, dto: UpdatePurchaseOrderStatusDto): Promise<{
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        tenantId: string;
        branchId: string | null;
        note: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        warehouseId: string | null;
        vendorId: string;
        orderedAt: Date | null;
        receivedAt: Date | null;
    }>;
}
