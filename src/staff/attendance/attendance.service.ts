import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AttendanceService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    async checkIn(dto: CheckInDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // 1. Find user by PIN
        const user = await (this.prisma.client as any).user.findFirst({
            where: { pinCode: dto.pinCode }
        });

        if (!user) throw new ForbiddenException('Invalid PIN code');

        // 2. Check if already checked in
        const activeAttendance = await (this.prisma.client as any).attendance.findFirst({
            where: { userId: user.id, checkOut: null }
        });

        if (activeAttendance) {
            throw new BadRequestException('User is already checked in');
        }

        // 3. Create attendance record
        return (this.prisma.client as any).attendance.create({
            data: {
                userId: user.id,
                branchId: dto.branchId || user.branchId,
                checkIn: new Date()
            }
        });
    }

    async checkOut(dto: CheckOutDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // 1. Find user by PIN
        const user = await (this.prisma.client as any).user.findFirst({
            where: { pinCode: dto.pinCode }
        });

        if (!user) throw new ForbiddenException('Invalid PIN code');

        // 2. Find active attendance
        const attendance = await (this.prisma.client as any).attendance.findFirst({
            where: { userId: user.id, checkOut: null },
            orderBy: { checkIn: 'desc' }
        });

        if (!attendance) {
            throw new BadRequestException('No active attendance found for this user');
        }

        // 3. Calculate duration
        const checkOutTime = new Date();
        const durationMinutes = Math.floor((checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60));

        return (this.prisma.client as any).attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: checkOutTime,
                durationMinutes
            }
        });
    }

    async getMonthlyAttendance(userId: string, month: number, year: number) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const attendances = await (this.prisma.client as any).attendance.findMany({
            where: {
                userId,
                checkIn: { gte: startDate, lte: endDate }
            },
            orderBy: { checkIn: 'asc' }
        });

        const totalMinutes = attendances.reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(2);

        // Fetch user for payroll info
        const user = await (this.prisma.client as any).user.findUnique({
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
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).attendance.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, pinCode: false } } }
        });
    }
}
