import { BackupService } from './backup.service';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    triggerBackup(): Promise<{
        filename: string;
        path: string;
    } | undefined>;
    listBackups(): Promise<{
        filename: string;
        size: number;
        createdAt: Date;
    }[]>;
}
