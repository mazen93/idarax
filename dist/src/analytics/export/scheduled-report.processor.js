"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ScheduledReportProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledReportProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../prisma/prisma.service");
const export_service_1 = require("./export.service");
const nodemailer = __importStar(require("nodemailer"));
const common_1 = require("@nestjs/common");
let ScheduledReportProcessor = ScheduledReportProcessor_1 = class ScheduledReportProcessor {
    prisma;
    exportService;
    logger = new common_1.Logger(ScheduledReportProcessor_1.name);
    constructor(prisma, exportService) {
        this.prisma = prisma;
        this.exportService = exportService;
    }
    async handleGenerateReport(job) {
        const { reportId } = job.data;
        const report = await this.prisma.scheduledReport.findUnique({
            where: { id: reportId },
            include: { tenant: true },
        });
        if (!report || !report.isActive) {
            this.logger.warn(`Report ${reportId} not found or inactive. Skipping.`);
            return;
        }
        this.logger.log(`Generating ${report.type} report in ${report.format} for ${report.recipientEmail}`);
        try {
            let attachment;
            let filename = '';
            let contentType = '';
            if (report.format === 'PDF') {
                const pdfBytes = await this.exportService.exportOrdersToPdf();
                attachment = Buffer.from(pdfBytes);
                filename = `${report.type.toLowerCase()}_report.pdf`;
                contentType = 'application/pdf';
            }
            else {
                const csvString = await this.exportService.exportOrdersToCsv();
                attachment = csvString;
                filename = `${report.type.toLowerCase()}_report.csv`;
                contentType = 'text/csv';
            }
            await this.sendEmail(report.recipientEmail, report.type, attachment, filename, contentType);
            await this.prisma.scheduledReport.update({
                where: { id: report.id },
                data: { lastSentAt: new Date() }
            });
            this.logger.log(`Report ${reportId} sent successfully to ${report.recipientEmail}`);
        }
        catch (error) {
            this.logger.error(`Failed to process report job ${reportId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async sendEmail(to, type, content, filename, contentType) {
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
};
exports.ScheduledReportProcessor = ScheduledReportProcessor;
__decorate([
    (0, bull_1.Process)('generate-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduledReportProcessor.prototype, "handleGenerateReport", null);
exports.ScheduledReportProcessor = ScheduledReportProcessor = ScheduledReportProcessor_1 = __decorate([
    (0, bull_1.Processor)('reports'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        export_service_1.ExportService])
], ScheduledReportProcessor);
//# sourceMappingURL=scheduled-report.processor.js.map