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
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            branchId: string | null;
            location: string | null;
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
