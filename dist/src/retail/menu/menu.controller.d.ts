import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    create(dto: CreateMenuDto): Promise<any>;
    findAll(branchId?: string): Promise<any>;
    findActive(branchId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateMenuDto): Promise<any>;
    remove(id: string): Promise<any>;
}
