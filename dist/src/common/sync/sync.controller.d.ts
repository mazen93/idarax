import { SyncService } from './sync.service';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    syncBatch(req: any, data: {
        orders: any[];
    }): Promise<{
        success: number;
        failed: number;
        errors: any[];
    }>;
}
