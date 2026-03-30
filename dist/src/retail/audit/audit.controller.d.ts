import { AuditService } from './audit.service';
import { StartAuditDto, UpdateAuditDto } from './dto/audit.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    start(dto: StartAuditDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateAuditDto): Promise<any>;
    commit(id: string): Promise<any>;
    cancel(id: string): Promise<any>;
}
