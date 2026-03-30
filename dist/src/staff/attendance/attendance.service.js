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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let AttendanceService = class AttendanceService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async checkIn(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const user = await this.prisma.client.user.findFirst({
            where: { pinCode: dto.pinCode }
        });
        if (!user)
            throw new common_1.ForbiddenException('Invalid PIN code');
        const activeAttendance = await this.prisma.client.attendance.findFirst({
            where: { userId: user.id, checkOut: null }
        });
        if (activeAttendance) {
            throw new common_1.BadRequestException('User is already checked in');
        }
        return this.prisma.client.attendance.create({
            data: {
                userId: user.id,
                branchId: dto.branchId || user.branchId,
                checkIn: new Date()
            }
        });
    }
    async checkOut(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const user = await this.prisma.client.user.findFirst({
            where: { pinCode: dto.pinCode }
        });
        if (!user)
            throw new common_1.ForbiddenException('Invalid PIN code');
        const attendance = await this.prisma.client.attendance.findFirst({
            where: { userId: user.id, checkOut: null },
            orderBy: { checkIn: 'desc' }
        });
        if (!attendance) {
            throw new common_1.BadRequestException('No active attendance found for this user');
        }
        const checkOutTime = new Date();
        const durationMinutes = Math.floor((checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60));
        return this.prisma.client.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: checkOutTime,
                durationMinutes
            }
        });
    }
    async getMonthlyAttendance(userId, month, year) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const attendances = await this.prisma.client.attendance.findMany({
            where: {
                userId,
                checkIn: { gte: startDate, lte: endDate }
            },
            orderBy: { checkIn: 'asc' }
        });
        const totalMinutes = attendances.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(2);
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: { hourlyRate: true, fixedSalary: true, name: true }
        });
        const estimatedSalary = user.hourlyRate ? (Number(user.hourlyRate) * Number(totalHours)).toFixed(2) : null;
        return {
            userId,
            userName: user.name,
            month,
            year,
            attendances,
            totalHours: Number(totalHours),
            estimatedSalary: estimatedSalary ? Number(estimatedSalary) : null,
            fixedSalary: user.fixedSalary ? Number(user.fixedSalary) : null
        };
    }
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.attendance.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, pinCode: false } } }
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map