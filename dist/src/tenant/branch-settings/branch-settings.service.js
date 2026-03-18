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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let BranchSettingsService = class BranchSettingsService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async getByBranch(branchId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Branch not found');
        }
        const settings = await this.prisma.client.branchSettings.findUnique({
            where: { branchId },
        });
        return settings || { branchId, tenantId, isActive: false };
    }
    async upsert(branchId, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branch = await this.prisma.client.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Branch not found');
        }
        const data = { ...dto };
        return this.prisma.client.branchSettings.upsert({
            where: { branchId },
            create: {
                branchId,
                tenantId,
                ...data
            },
            update: data
        });
    }
};
exports.BranchSettingsService = BranchSettingsService;
exports.BranchSettingsService = BranchSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], BranchSettingsService);
//# sourceMappingURL=branch-settings.service.js.map