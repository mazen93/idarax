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
exports.TableSectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const tenant_service_1 = require("../../../tenant/tenant.service");
let TableSectionService = class TableSectionService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async create(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.tableSection.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.tableSection.findMany({
            where: { tenantId },
            include: {
                tables: true,
            },
        });
    }
    async findOne(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const section = await this.prisma.client.tableSection.findUnique({
            where: { id },
            include: { tables: true }
        });
        if (!section || section.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Section not found or access denied');
        }
        return section;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.client.tableSection.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.client.tableSection.delete({
            where: { id },
        });
    }
};
exports.TableSectionService = TableSectionService;
exports.TableSectionService = TableSectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], TableSectionService);
//# sourceMappingURL=table-section.service.js.map