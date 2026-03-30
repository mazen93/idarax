import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateTransferDto, UpdateTransferStatusDto } from './dto/transfer.dto';
export declare class TransferService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateTransferDto): Promise<{
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
        source: {
            id: string;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        };
        destination: {
            id: string;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            nameAr: string | null;
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
        source: {
            id: string;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        };
        destination: {
            id: string;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            nameAr: string | null;
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
        source: {
            id: string;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            nameAr: string | null;
            location: string | null;
        };
        destination: {
            id: string;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string | null;
            nameAr: string | null;
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
