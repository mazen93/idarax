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
exports.SerialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let SerialService = class SerialService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async register(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const existing = await this.prisma.serialNumber.findUnique({
            where: { serial_tenantId: { serial: dto.serial, tenantId } },
        });
        if (existing) {
            throw new common_1.ConflictException('Serial number already exists for this tenant');
        }
        return this.prisma.serialNumber.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }
    async findBySerial(serial) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const result = await this.prisma.serialNumber.findUnique({
            where: { serial_tenantId: { serial, tenantId } },
            include: { product: true },
        });
        if (!result)
            throw new common_1.NotFoundException('Serial number not found');
        return result;
    }
    async updateStatus(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const serialNumber = await this.prisma.serialNumber.findUnique({
            where: { id },
        });
        if (!serialNumber || serialNumber.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.serialNumber.update({
            where: { id },
            data: { status: dto.status },
        });
    }
    async findByProduct(productId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.serialNumber.findMany({
            where: { productId, tenantId },
        });
    }
};
exports.SerialService = SerialService;
exports.SerialService = SerialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], SerialService);
//# sourceMappingURL=serial.service.js.map