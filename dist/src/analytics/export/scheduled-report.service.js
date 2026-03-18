"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
const bull_1 = require("@nestjs/bull");
let ScheduledReportService = class ScheduledReportService {
    prisma;
    tenantService;
    reportQueue;
    constructor(prisma, tenantService, reportQueue) {
        this.prisma = prisma;
        this.tenantService = tenantService;
        this.reportQueue = reportQueue;
    }
    async create(dto) {
        const tenantId = this.tenantService.getTenantId();
        const report = await this.prisma.scheduledReport.create({
            data: {
                ...dto,
                tenantId,
            }
        });
        let cron = '';
        if (dto.type === 'DAILY_SALES')
            cron = '0 0 * * *';
        else if (dto.type === 'WEEKLY_SALES')
            cron = '0 0 * * 0';
        else if (dto.type === 'INVENTORY_VALUATION')
            cron = '0 0 * * *';
        await this.reportQueue.add('generate-report', { reportId: report.id }, {
            repeat: { cron },
            jobId: report.id,
        });
        return report;
    }
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.scheduledReport.findMany({
            where: { tenantId }
        });
    }
    async remove(id) {
        const tenantId = this.tenantService.getTenantId();
        const report = await this.prisma.scheduledReport.findFirst({
            where: { id, tenantId }
        });
        if (!report)
            throw new common_1.NotFoundException('Scheduled report not found');
        await this.prisma.scheduledReport.delete({ where: { id } });
        await this.reportQueue.removeRepeatableByKey(report.id);
        return { success: true };
    }
    async toggle(id, isActive) {
        const tenantId = this.tenantService.getTenantId();
        const report = await this.prisma.scheduledReport.updateMany({
            where: { id, tenantId },
            data: { isActive }
        });
        if (report.count === 0)
            throw new common_1.NotFoundException('Scheduled report not found');
        return { success: true };
    }
};
exports.ScheduledReportService = ScheduledReportService;
exports.ScheduledReportService = ScheduledReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)('reports')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService, Object])
], ScheduledReportService);
//# sourceMappingURL=scheduled-report.service.js.map