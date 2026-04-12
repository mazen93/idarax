import { TransferService } from './transfer.service';
import { CreateTransferDto, UpdateTransferStatusDto } from './dto/transfer.dto';
export declare class TransferController {
    private readonly transferService;
    constructor(transferService: TransferService);
    create(dto: CreateTransferDto): Promise<{
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
        source: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        };
        destination: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tenantId: string;
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
        source: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        };
        destination: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tenantId: string;
        productId: string;
        quantity: number;
        sourceId: string;
        destinationId: string;
    })[]>;
    updateStatus(id: string, dto: UpdateTransferStatusDto): Promise<{
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
        source: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        };
        destination: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tenantId: string;
        productId: string;
        quantity: number;
        sourceId: string;
        destinationId: string;
    }>;
}
