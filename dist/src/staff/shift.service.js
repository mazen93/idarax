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
exports.ShiftService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
let ShiftService = class ShiftService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async clockIn(userId, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId() || undefined;
        const openShift = await this.prisma.client.shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
        });
        if (openShift) {
            throw new common_1.BadRequestException('You already have an open shift');
        }
        return this.prisma.client.shift.create({
            data: {
                userId,
                tenantId,
                branchId,
                startTime: new Date(),
                status: 'OPEN',
                note: dto.note,
            },
        });
    }
    async getCurrentShift(userId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const shift = await this.prisma.client.shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
            include: {
                breaks: {
                    orderBy: { startTime: 'asc' },
                }
            }
        });
        return {
            shift: shift ?? null,
            serverTime: new Date(),
        };
    }
    async clockOut(userId, dto) {
        const tenantId = this.tenantService.getTenantId();
        const shift = await this.prisma.client.shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
            include: { breaks: true }
        });
        if (!shift) {
            throw new common_1.BadRequestException('No active shift found');
        }
        const openBreak = shift.breaks.find((b) => !b.endTime);
        if (openBreak) {
            await this.prisma.client.shiftBreak.update({
                where: { id: openBreak.id },
                data: { endTime: new Date() }
            });
        }
        return this.prisma.client.shift.update({
            where: { id: shift.id },
            data: {
                endTime: new Date(),
                status: 'CLOSED',
                note: dto.note || shift.note
            }
        });
    }
    async startBreak(userId, dto) {
        const tenantId = this.tenantService.getTenantId();
        const shift = await this.prisma.client.shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
            include: { breaks: true }
        });
        if (!shift) {
            throw new common_1.BadRequestException('Must have an active shift to start a break');
        }
        if (shift.breaks.some((b) => !b.endTime)) {
            throw new common_1.BadRequestException('You are already on a break');
        }
        return this.prisma.client.shiftBreak.create({
            data: {
                shiftId: shift.id,
                startTime: new Date(),
                type: dto.type,
            }
        });
    }
    async endBreak(userId) {
        const tenantId = this.tenantService.getTenantId();
        const shift = await this.prisma.client.shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
            include: { breaks: true }
        });
        if (!shift) {
            throw new common_1.BadRequestException('No active shift found');
        }
        const openBreak = shift.breaks.find((b) => !b.endTime);
        if (!openBreak) {
            throw new common_1.BadRequestException('Not currently on a break');
        }
        return this.prisma.client.shiftBreak.update({
            where: { id: openBreak.id },
            data: { endTime: new Date() }
        });
    }
    async getAllShifts(from, to, branchId) {
        const tenantId = this.tenantService.getTenantId();
        const where = { tenantId };
        if (from || to) {
            where.startTime = {};
            if (from)
                where.startTime.gte = from;
            if (to)
                where.startTime.lte = to;
        }
        return this.prisma.client.shift.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } },
                breaks: true,
                branch: { select: { name: true } }
            },
            orderBy: { startTime: 'desc' }
        });
    }
};
exports.ShiftService = ShiftService;
exports.ShiftService = ShiftService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], ShiftService);
//# sourceMappingURL=shift.service.js.map