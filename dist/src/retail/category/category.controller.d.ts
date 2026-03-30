import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
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
    findAll(): Promise<({
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
