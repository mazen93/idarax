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
exports.PrinterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PrinterService = class PrinterService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        return this.prisma.printer.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }
    async findAll(tenantId, branchId) {
        return this.prisma.printer.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, tenantId) {
        const printer = await this.prisma.printer.findFirst({
            where: { id, tenantId },
        });
        if (!printer)
            throw new common_1.NotFoundException('Printer not found');
        return printer;
    }
    async update(id, tenantId, data) {
        await this.findOne(id, tenantId);
        return this.prisma.printer.update({
            where: { id },
            data,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.printer.delete({
            where: { id },
        });
    }
};
exports.PrinterService = PrinterService;
exports.PrinterService = PrinterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrinterService);
//# sourceMappingURL=printer.service.js.map