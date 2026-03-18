import { DrawerService } from './drawer.service';
import { OpenDrawerDto, CloseDrawerDto, AddMovementDto } from './dto/drawer.dto';
export declare class DrawerController {
    private readonly drawerService;
    constructor(drawerService: DrawerService);
    open(req: any, dto: OpenDrawerDto): Promise<any>;
    close(req: any, dto: CloseDrawerDto): Promise<any>;
    addMovement(req: any, dto: AddMovementDto): Promise<any>;
    getCurrent(req: any): Promise<any>;
    getReport(id: string): Promise<any>;
    getHistory(from?: string, to?: string, branchId?: string): Promise<any>;
}
