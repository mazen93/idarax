
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantService: TenantService
    ) { }

    private get db() {
        return this.prisma as any;
    }

    async create(dto: CreateMenuDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const { categoryIds, ...menuData } = dto;

        return this.db.menu.create({
            data: {
                ...menuData,
                tenantId,
                categories: {
                    create: categoryIds.map(categoryId => ({ categoryId }))
                }
            },
            include: { categories: { include: { category: true } } }
        });
    }

    async findAll(branchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.db.menu.findMany({
            where: {
                tenantId,
                OR: [
                    { branchId: branchId || null },
                    { branchId: null }
                ]
            },
            include: { categories: { include: { category: true } } }
        });
    }

    async findActive(branchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5); // HH:mm
        const currentDay = now.getDay(); // 0-6

        const allMenus = await this.db.menu.findMany({
            where: {
                tenantId,
                OR: [
                    { branchId: branchId || null },
                    { branchId: null }
                ],
                daysOfWeek: { has: currentDay }
            },
            include: { categories: { include: { category: true } } }
        });

        const activeMenus = allMenus.filter((menu: any) => {
            if (menu.startTime <= menu.endTime) {
                // Normal window (e.g. 08:00 - 12:00)
                return currentTime >= menu.startTime && currentTime <= menu.endTime;
            } else {
                // Overnight window (e.g. 22:00 - 04:00)
                return currentTime >= menu.startTime || currentTime <= menu.endTime;
            }
        });

        return activeMenus;
    }

    async findOne(id: string) {
        const tenantId = this.tenantService.getTenantId();
        const menu = await this.db.menu.findUnique({
            where: { id },
            include: { categories: { include: { category: true } } }
        });

        if (!menu || menu.tenantId !== tenantId) {
            throw new NotFoundException('Menu not found');
        }

        return menu;
    }

    async update(id: string, dto: UpdateMenuDto) {
        const tenantId = this.tenantService.getTenantId();
        const { categoryIds, ...menuData } = dto;

        // Verify ownership
        await this.findOne(id);

        return this.prisma.$transaction(async (tx: any) => {
            if (categoryIds) {
                // Reset categories
                await tx.menuCategory.deleteMany({ where: { menuId: id } });
                await tx.menuCategory.createMany({
                    data: categoryIds.map(categoryId => ({ menuId: id, categoryId }))
                });
            }

            return tx.menu.update({
                where: { id, tenantId },
                data: menuData,
                include: { categories: { include: { category: true } } }
            });
        });
    }

    async remove(id: string) {
        const tenantId = this.tenantService.getTenantId();
        await this.findOne(id);

        return this.db.menu.delete({
            where: { id, tenantId }
        });
    }
}
