import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto';
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
            email: string | null;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            phone: string | null;
            address: string | null;
        };
    } & {
        number: string;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        warehouseId: string | null;
        vendorId: string;
        orderedAt: Date | null;
        receivedAt: Date | null;
    }>;
    findAll(): Promise<({
        items: ({
            product: {
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
        } & {
            id: string;
            costPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            purchaseOrderId: string;
            receivedQty: number;
        })[];
        warehouse: {
            id: string;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        } | null;
        vendor: {
            id: string;
            email: string | null;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            phone: string | null;
            address: string | null;
        };
    } & {
        number: string;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        warehouseId: string | null;
        vendorId: string;
        orderedAt: Date | null;
        receivedAt: Date | null;
    })[]>;
    updateStatus(id: string, dto: UpdatePurchaseOrderStatusDto): Promise<{
        number: string;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        warehouseId: string | null;
        vendorId: string;
        orderedAt: Date | null;
        receivedAt: Date | null;
    }>;
}
