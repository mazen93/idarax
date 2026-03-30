import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoryService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
        imageUrl: string | null;
    }>;
    findAll(menuId?: string): Promise<({
        _count: {
            products: number;
        };
        menus: {
            menuId: string;
        }[];
    } & {
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
        imageUrl: string | null;
    })[]>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
        imageUrl: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
        imageUrl: string | null;
    }>;
}
