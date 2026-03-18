import { KdsService } from './kds.service';
import { CreateKitchenStationDto, UpdateOrderItemStatusDto, AssignStaffDto } from './dto/kds.dto';
export declare class KdsController {
    private readonly kdsService;
    constructor(kdsService: KdsService);
    createStation(dto: CreateKitchenStationDto): Promise<any>;
    getStations(): Promise<any>;
    getStationItems(id: string): Promise<any>;
    updateItemStatus(id: string, dto: UpdateOrderItemStatusDto): Promise<any>;
    assignStaff(id: string, dto: AssignStaffDto): Promise<any>;
}
