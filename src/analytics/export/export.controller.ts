import { Controller, Get, Post, Delete, Patch, Body, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { ScheduledReportService } from './scheduled-report.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { ReportType, ReportFormat } from '@prisma/client';

@Controller('analytics/export')
@UseGuards(JwtAuthGuard)
export class ExportController {
    constructor(
        private readonly exportService: ExportService,
        private readonly schedulerService: ScheduledReportService,
    ) { }

    @Get('csv')
    @Permissions(Actions.REPORTS.EXPORT)
    async downloadCsv(@Res() res: Response) {
        const csv = await this.exportService.exportOrdersToCsv();
        res.header('Content-Type', 'text/csv');
        res.attachment('report.csv');
        return res.send(csv);
    }

    @Get('pdf')
    @Permissions(Actions.REPORTS.EXPORT)
    async downloadPdf(@Res() res: Response) {
        const pdf = await this.exportService.exportOrdersToPdf();
        res.header('Content-Type', 'application/pdf');
        res.attachment('report.pdf');
        return res.send(Buffer.from(pdf));
    }

    // --- Scheduled Reports ---

    @Post('scheduled')
    @Permissions(Actions.REPORTS.EXPORT)
    async createScheduled(@Body() dto: { type: ReportType, format: ReportFormat, recipientEmail: string }) {
        return this.schedulerService.create(dto);
    }

    @Get('scheduled')
    @Permissions(Actions.REPORTS.EXPORT)
    async listScheduled() {
        return this.schedulerService.findAll();
    }

    @Delete('scheduled/:id')
    @Permissions(Actions.REPORTS.EXPORT)
    async removeScheduled(@Param('id') id: string) {
        return this.schedulerService.remove(id);
    }

    @Patch('scheduled/:id/toggle')
    @Permissions(Actions.REPORTS.EXPORT)
    async toggleScheduled(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.schedulerService.toggle(id, isActive);
    }
}
