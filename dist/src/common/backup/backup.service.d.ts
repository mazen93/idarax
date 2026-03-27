export declare class BackupService {
    private readonly logger;
    private readonly backupDir;
    private readonly retentionDays;
    constructor();
    handleCron(): Promise<void>;
    runBackup(): Promise<{
        filename: string;
        path: string;
    } | undefined>;
    cleanupOldBackups(): Promise<void>;
    getBackups(): {
        filename: string;
        size: number;
        createdAt: Date;
    }[];
}
