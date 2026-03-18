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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
let ScheduleService = class ScheduleService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async create(dto) {
        const tenantId = this.tenantService.getTenantId();
        const conflict = await this.prisma.scheduledShift.findFirst({
            where: {
                userId: dto.userId,
                tenantId,
                status: { not: 'CANCELLED' },
                OR: [
                    {
                        startAt: { lt: dto.endAt },
                        endAt: { gt: dto.startAt },
                    },
                ],
            },
        });
        if (conflict) {
            throw new common_1.BadRequestException('Shift overlaps with an existing scheduled shift for this user.');
        }
        return this.prisma.scheduledShift.create({
            data: {
                ...dto,
                tenantId,
            }
        });
    }
    async findAll(startDate, endDate, branchId) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.scheduledShift.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                startAt: { gte: startDate },
                endAt: { lte: endDate },
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                branch: { select: { id: true, name: true } },
            },
            orderBy: { startAt: 'asc' },
        });
    }
    async findByUser(userId, startDate, endDate) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.scheduledShift.findMany({
            where: {
                tenantId,
                userId,
                startAt: { gte: startDate },
                endAt: { lte: endDate },
            },
            include: {
                branch: { select: { id: true, name: true } },
            },
            orderBy: { startAt: 'asc' },
        });
    }
    async update(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        const existing = await this.prisma.scheduledShift.findFirst({
            where: { id, tenantId }
        });
        if (!existing)
            throw new common_1.NotFoundException('Scheduled shift not found');
        if (dto.startAt || dto.endAt) {
            const start = dto.startAt || existing.startAt;
            const end = dto.endAt || existing.endAt;
            const conflict = await this.prisma.scheduledShift.findFirst({
                where: {
                    id: { not: id },
                    userId: existing.userId,
                    tenantId,
                    status: { not: 'CANCELLED' },
                    OR: [
                        {
                            startAt: { lt: end },
                            endAt: { gt: start },
                        },
                    ],
                },
            });
            if (conflict) {
                throw new common_1.BadRequestException('Updated time overlaps with an existing scheduled shift.');
            }
        }
        return this.prisma.scheduledShift.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        const tenantId = this.tenantService.getTenantId();
        const existing = await this.prisma.scheduledShift.findFirst({
            where: { id, tenantId }
        });
        if (!existing)
            throw new common_1.NotFoundException('Scheduled shift not found');
        return this.prisma.scheduledShift.delete({ where: { id } });
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map