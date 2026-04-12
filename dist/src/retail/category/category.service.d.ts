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
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        imageUrl: string | null;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        imageUrl: string | null;
        defaultStationId: string | null;
    })[]>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        imageUrl: string | null;
        defaultStationId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        imageUrl: string | null;
        defaultStationId: string | null;
    }>;
}
