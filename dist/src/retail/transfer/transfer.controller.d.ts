import { TransferService } from './transfer.service';
import { CreateTransferDto, UpdateTransferStatusDto } from './dto/transfer.dto';
export declare class TransferController {
    private readonly transferService;
    constructor(transferService: TransferService);
    create(dto: CreateTransferDto): Promise<{
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
        destination: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            branchId: string | null;
            location: string | null;
        };
        source: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            branchId: string | null;
            location: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        productId: string;
        quantity: number;
        sourceId: string;
        destinationId: string;
    }>;
    findAll(): Promise<({
        product: {
            id: string;
            name: string;
            sku: string | null;
        };
        destination: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            branchId: string | null;
            location: string | null;
        };
        source: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            branchId: string | null;
            location: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        productId: string;
        quantity: number;
        sourceId: string;
        destinationId: string;
    })[]>;
    updateStatus(id: string, dto: UpdateTransferStatusDto): Promise<{
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
        destination: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            branchId: string | null;
            location: string | null;
        };
        source: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            branchId: string | null;
            location: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        productId: string;
        quantity: number;
        sourceId: string;
        destinationId: string;
    }>;
}
