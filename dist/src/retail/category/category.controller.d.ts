import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        imageUrl: string | null;
        tenantId: string;
        defaultStationId: string | null;
    }>;
    findAll(): Promise<({
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
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        imageUrl: string | null;
        tenantId: string;
        defaultStationId: string | null;
    })[]>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        imageUrl: string | null;
        tenantId: string;
        defaultStationId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        descriptionAr: string | null;
        nameAr: string | null;
        defaultPrepTime: number;
        imageUrl: string | null;
        tenantId: string;
        defaultStationId: string | null;
    }>;
}
