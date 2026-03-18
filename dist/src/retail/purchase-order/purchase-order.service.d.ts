import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto';
export declare class PurchaseOrderService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreatePurchaseOrderDto): Promise<{
        vendor: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            nameAr: string | null;
            email: string | null;
        };
        items: {
            id: string;
            costPrice: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            quantity: number;
            purchaseOrderId: string;
            receivedQty: number;
        }[];
    } & {
        number: string;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        note: string | null;
        warehouseId: string | null;
        vendorId: string;
        orderedAt: Date | null;
        receivedAt: Date | null;
    }>;
    findAll(): Promise<({
        warehouse: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            branchId: string | null;
            location: string | null;
        } | null;
        vendor: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            nameAr: string | null;
            email: string | null;
        };
        items: ({
            product: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                nameAr: string | null;
                description: string | null;
                descriptionAr: string | null;
                defaultStationId: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                sku: string | null;
                barcode: string | null;
                costPrice: import("@prisma/client-runtime-utils").Decimal;
                isSellable: boolean;
                productType: import("@prisma/client").$Enums.ProductType;
                categoryId: string;
            };
        } & {
            id: string;
            costPrice: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
            quantity: number;
            purchaseOrderId: string;
            receivedQty: number;
        })[];
    } & {
        number: string;
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
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
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        note: string | null;
        warehouseId: string | null;
        vendorId: string;
        orderedAt: Date | null;
        receivedAt: Date | null;
    }>;
    private receiveOrder;
}
