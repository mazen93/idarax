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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
const json2csv_1 = require("json2csv");
const pdf_lib_1 = require("pdf-lib");
let ExportService = class ExportService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async exportOrdersToCsv() {
        const tenantId = this.tenantService.getTenantId();
        const orders = await this.prisma.order.findMany({
            where: { tenantId },
            include: { items: { include: { product: true } } },
        });
        const data = orders.map((order) => ({
            id: order.id,
            total: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            items: order.items.map((i) => i.product.name).join(', '),
        }));
        const parser = new json2csv_1.Parser();
        return parser.parse(data);
    }
    async exportOrdersToPdf() {
        const tenantId = this.tenantService.getTenantId();
        const orders = await this.prisma.order.findMany({
            where: { tenantId },
            take: 10,
        });
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage();
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        page.drawText(`Sales Report - Tenant: ${tenantId}`, { x: 50, y: 750, size: 20, font });
        let y = 700;
        for (const order of orders) {
            page.drawText(`Order: ${order.id} - Total: $${order.totalAmount} - Date: ${order.createdAt}`, {
                x: 50,
                y,
                size: 12,
                font,
            });
            y -= 20;
        }
        return await pdfDoc.save();
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], ExportService);
//# sourceMappingURL=export.service.js.map