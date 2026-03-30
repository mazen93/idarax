import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

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

    async create(dto: CreateBranchDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const tenant = await this.prisma.client.tenant.findUnique({
            where: { id: tenantId },
            select: { maxBranches: true }
        });

        const branchCount = await this.db.count({
            where: { tenantId }
        });

        if (branchCount >= (tenant?.maxBranches || 1)) {
            throw new ForbiddenException(`You have reached the maximum number of branches (${tenant?.maxBranches || 1}) allowed for your current subscription plan. Please upgrade to add more branches.`);
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Create the Branch
            const branch = await tx.branch.create({
                data: {
                    ...dto,
                    tenantId,
                },
            });

            // 2. Auto-initialize Catalog (clone master products to branch)
            const products = await tx.product.findMany({
                where: { tenantId },
                select: { id: true },
            });

            if (products.length > 0) {
                await tx.branchProduct.createMany({
                    data: products.map((p) => ({
                        branchId: branch.id,
                        productId: p.id,
                        isAvailable: true,
                    })),
                    skipDuplicates: true,
                });
            }

            // 3. Create default Warehouse for this branch
            await tx.warehouse.create({
                data: {
                    name: `Main Warehouse - ${branch.name}`,
                    tenantId,
                    branchId: branch.id,
                },
            });

            // 4. Create default Kitchen Station
            await tx.kitchenStation.create({
                data: {
                    name: `Main Kitchen - ${branch.name}`,
                    tenantId,
                    branchId: branch.id,
                },
            });

            // 5. Create default Table Section
            await tx.tableSection.create({
                data: {
                    name: `Main Floor - ${branch.name}`,
                    tenantId,
                    branchId: branch.id,
                },
            });

            return branch;
        });
    }

    async update(id: string, dto: UpdateBranchDto) {
        const branch = await this.findOne(id);

        if (dto.isActive === false && branch.isActive === true) {
            // Check if this is the last active branch
            const activeBranchesCount = await this.db.count({
                where: { isActive: true },
            });

            if (activeBranchesCount <= 1) {
                throw new BadRequestException('Cannot deactivate the only active branch. You must have at least one active branch.');
            }
        }

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
