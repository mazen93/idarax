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
exports.WaitingService = exports.ReservationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let ReservationService = class ReservationService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    get context() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return { tenantId, branchId: this.tenantService.getBranchId() };
    }
    async create(dto) {
        const { date, ...rest } = dto;
        const { tenantId } = this.context;
        return this.prisma.client.reservation.create({
            data: { ...rest, date: new Date(date), tenantId },
            include: { table: { select: { number: true } }, customer: { select: { name: true } } },
        });
    }
    async findAll() {
        const { tenantId } = this.context;
        return this.prisma.client.reservation.findMany({
            where: { tenantId },
            include: { table: { select: { number: true } }, customer: { select: { name: true } } },
            orderBy: { date: 'asc' },
        });
    }
    async update(id, dto) {
        const res = await this.prisma.client.reservation.findUnique({ where: { id } });
        const { tenantId } = this.context;
        if (!res || res.tenantId !== tenantId)
            throw new common_1.NotFoundException('Reservation not found');
        const { date, ...rest } = dto;
        const data = date ? { ...rest, date: new Date(date) } : rest;
        return this.prisma.client.reservation.update({
            where: { id },
            data,
            include: { table: { select: { number: true } } },
        });
    }
    async remove(id) {
        const res = await this.prisma.client.reservation.findUnique({ where: { id } });
        const { tenantId } = this.context;
        if (!res || res.tenantId !== tenantId)
            throw new common_1.NotFoundException('Reservation not found');
        return this.prisma.client.reservation.delete({ where: { id } });
    }
};
exports.ReservationService = ReservationService;
exports.ReservationService = ReservationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, tenant_service_1.TenantService])
], ReservationService);
let WaitingService = class WaitingService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    get context() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return { tenantId, branchId: this.tenantService.getBranchId() };
    }
    async create(dto) {
        const { tenantId, branchId } = this.context;
        return this.prisma.client.waitingEntry.create({
            data: { ...dto, tenantId, branchId },
            include: { customer: { select: { name: true } } },
        });
    }
    async findAll() {
        const { tenantId, branchId } = this.context;
        const where = { tenantId };
        if (branchId)
            where.branchId = branchId;
        return this.prisma.client.waitingEntry.findMany({
            where,
            include: { customer: { select: { name: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async update(id, dto) {
        const entry = await this.prisma.client.waitingEntry.findUnique({ where: { id } });
        const { tenantId } = this.context;
        if (!entry || entry.tenantId !== tenantId)
            throw new common_1.NotFoundException('Entry not found');
        return this.prisma.client.waitingEntry.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const entry = await this.prisma.client.waitingEntry.findUnique({ where: { id } });
        const { tenantId } = this.context;
        if (!entry || entry.tenantId !== tenantId)
            throw new common_1.NotFoundException('Entry not found');
        return this.prisma.client.waitingEntry.delete({ where: { id } });
    }
};
exports.WaitingService = WaitingService;
exports.WaitingService = WaitingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, tenant_service_1.TenantService])
], WaitingService);
//# sourceMappingURL=reservation.service.js.map