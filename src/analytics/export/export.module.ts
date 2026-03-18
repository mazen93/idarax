import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';
import { BullModule } from '@nestjs/bull';
import { ScheduledReportService } from './scheduled-report.service';
import { ScheduledReportProcessor } from './scheduled-report.processor';

@Module({
    imports: [
        PrismaModule, 
        TenantModule,
        BullModule.registerQueue({
            name: 'reports',
        }),
    ],
    providers: [ExportService, ScheduledReportService, ScheduledReportProcessor],
    controllers: [ExportController],
})
export class ExportModule { }
