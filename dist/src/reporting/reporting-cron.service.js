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
var ReportingCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const reporting_service_1 = require("./reporting.service");
let ReportingCronService = ReportingCronService_1 = class ReportingCronService {
    prisma;
    reportingService;
    logger = new common_1.Logger(ReportingCronService_1.name);
    constructor(prisma, reportingService) {
        this.prisma = prisma;
        this.reportingService = reportingService;
    }
    async handleDailyReports() {
        this.logger.log('Starting daily sales reports cron job...');
        const tenants = await this.prisma.tenant.findMany({
            select: { id: true }
        });
        for (const tenant of tenants) {
            await this.reportingService.sendDailySummary(tenant.id);
        }
        this.logger.log(`Finished daily sales reports for ${tenants.length} tenants.`);
    }
    async handleWeeklyReports() {
        this.logger.log('Starting weekly sales reports cron job...');
        const tenants = await this.prisma.tenant.findMany({
            select: { id: true }
        });
        for (const tenant of tenants) {
            await this.reportingService.sendWeeklySummary(tenant.id);
        }
        this.logger.log(`Finished weekly sales reports for ${tenants.length} tenants.`);
    }
};
exports.ReportingCronService = ReportingCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_7AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportingCronService.prototype, "handleDailyReports", null);
__decorate([
    (0, schedule_1.Cron)('0 8 * * 1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportingCronService.prototype, "handleWeeklyReports", null);
exports.ReportingCronService = ReportingCronService = ReportingCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reporting_service_1.ReportingService])
], ReportingCronService);
//# sourceMappingURL=reporting-cron.service.js.map