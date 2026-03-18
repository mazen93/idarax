import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { RegisterSerialDto, UpdateSerialStatusDto } from './dto/serial.dto';
export declare class SerialService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    register(dto: RegisterSerialDto): Promise<any>;
    findBySerial(serial: string): Promise<any>;
    updateStatus(id: string, dto: UpdateSerialStatusDto): Promise<any>;
    findByProduct(productId: string): Promise<any>;
}
