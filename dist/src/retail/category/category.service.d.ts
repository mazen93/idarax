import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoryService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateCategoryDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
    }>;
    findAll(menuId?: string): Promise<({
        menus: {
            menuId: string;
        }[];
        _count: {
            products: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
    })[]>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultPrepTime: number;
        defaultStationId: string | null;
    }>;
}
