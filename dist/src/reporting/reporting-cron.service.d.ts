import { PrismaService } from '../prisma/prisma.service';
import { ReportingService } from './reporting.service';
export declare class ReportingCronService {
    private readonly prisma;
    private readonly reportingService;
    private readonly logger;
    constructor(prisma: PrismaService, reportingService: ReportingService);
    handleDailyReports(): Promise<void>;
    handleWeeklyReports(): Promise<void>;
}
