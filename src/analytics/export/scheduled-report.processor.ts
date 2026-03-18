import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { ExportService } from './export.service';
import * as nodemailer from 'nodemailer';
import { Logger } from '@nestjs/common';

@Processor('reports')
export class ScheduledReportProcessor {
    private readonly logger = new Logger(ScheduledReportProcessor.name);

    constructor(
        private prisma: PrismaService,
        private exportService: ExportService,
    ) { }

    @Process('generate-report')
    async handleGenerateReport(job: Job<{ reportId: string }>) {
        const { reportId } = job.data;
        const report = await (this.prisma as any).scheduledReport.findUnique({
            where: { id: reportId },
            include: { tenant: true },
        });

        if (!report || !report.isActive) {
            this.logger.warn(`Report ${reportId} not found or inactive. Skipping.`);
            return;
        }

        this.logger.log(`Generating ${report.type} report in ${report.format} for ${report.recipientEmail}`);

        try {
            let attachment: Buffer | string;
            let filename = '';
            let contentType = '';

            // Generate content based on type and format
            // For now, we reuse the generic export methods and extend them if needed
            if (report.format === 'PDF') {
                const pdfBytes = await this.exportService.exportOrdersToPdf();
                attachment = Buffer.from(pdfBytes);
                filename = `${report.type.toLowerCase()}_report.pdf`;
                contentType = 'application/pdf';
            } else {
                const csvString = await this.exportService.exportOrdersToCsv();
                attachment = csvString;
                filename = `${report.type.toLowerCase()}_report.csv`;
                contentType = 'text/csv';
            }

            // Send Email
            await this.sendEmail(report.recipientEmail, report.type, attachment, filename, contentType);

            // Update last sent at
            await (this.prisma as any).scheduledReport.update({
                where: { id: report.id },
                data: { lastSentAt: new Date() }
            });

            this.logger.log(`Report ${reportId} sent successfully to ${report.recipientEmail}`);
        } catch (error) {
            this.logger.error(`Failed to process report job ${reportId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async sendEmail(to: string, type: string, content: any, filename: string, contentType: string) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            auth: {
                user: process.env.SMTP_USER || 'demo@idarax.com',
                pass: process.env.SMTP_PASS || 'password',
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Idarax Reports" <reports@idarax.com>',
            to,
            subject: `Automated Report: ${type}`,
            text: `Please find attached your scheduled ${type} report.`,
            attachments: [
                {
                    filename,
                    content,
                    contentType,
                },
            ],
        });
    }
}
