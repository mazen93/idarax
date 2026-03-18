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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const export_service_1 = require("./export.service");
const scheduled_report_service_1 = require("./scheduled-report.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let ExportController = class ExportController {
    exportService;
    schedulerService;
    constructor(exportService, schedulerService) {
        this.exportService = exportService;
        this.schedulerService = schedulerService;
    }
    async downloadCsv(res) {
        const csv = await this.exportService.exportOrdersToCsv();
        res.header('Content-Type', 'text/csv');
        res.attachment('report.csv');
        return res.send(csv);
    }
    async downloadPdf(res) {
        const pdf = await this.exportService.exportOrdersToPdf();
        res.header('Content-Type', 'application/pdf');
        res.attachment('report.pdf');
        return res.send(Buffer.from(pdf));
    }
    async createScheduled(dto) {
        return this.schedulerService.create(dto);
    }
    async listScheduled() {
        return this.schedulerService.findAll();
    }
    async removeScheduled(id) {
        return this.schedulerService.remove(id);
    }
    async toggleScheduled(id, isActive) {
        return this.schedulerService.toggle(id, isActive);
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)('csv'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.EXPORT),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "downloadCsv", null);
__decorate([
    (0, common_1.Get)('pdf'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.EXPORT),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Post)('scheduled'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.EXPORT),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "createScheduled", null);
__decorate([
    (0, common_1.Get)('scheduled'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.EXPORT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "listScheduled", null);
__decorate([
    (0, common_1.Delete)('scheduled/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.EXPORT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "removeScheduled", null);
__decorate([
    (0, common_1.Patch)('scheduled/:id/toggle'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.EXPORT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "toggleScheduled", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('analytics/export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [export_service_1.ExportService,
        scheduled_report_service_1.ScheduledReportService])
], ExportController);
//# sourceMappingURL=export.controller.js.map