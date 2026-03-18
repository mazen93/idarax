import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { KdsGateway } from './kds.gateway';
import { CreateKitchenStationDto, UpdateOrderItemStatusDto, AssignStaffDto } from './dto/kds.dto';
export declare class KdsService {
    private prisma;
    private tenantService;
    private gateway;
    constructor(prisma: PrismaService, tenantService: TenantService, gateway: KdsGateway);
    createStation(dto: CreateKitchenStationDto): Promise<any>;
    getStations(): Promise<any>;
    assignStaff(stationId: string, dto: AssignStaffDto): Promise<any>;
    updateItemStatus(itemId: string, dto: UpdateOrderItemStatusDto): Promise<any>;
    getStationItems(stationId: string): Promise<any>;
}
