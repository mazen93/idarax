import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant.service';

@Injectable()
export class BranchService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    private get db() {
        return this.prisma.client.branch;
    }

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.db.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        orders: true,
                        tables: true,
                    }
                }
            }
        });
    }

    async findOne(id: string) {
        const branch = await this.db.findUnique({
            where: { id },
        });

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        return branch;
    }

    async create(dto: any) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.db.create({
            data: dto
        });
    }

    async update(id: string, dto: any) {
        await this.findOne(id); // Check ownership via automated filter

        return this.db.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Check ownership via automated filter

        return this.db.delete({
            where: { id },
        });
    }
}
