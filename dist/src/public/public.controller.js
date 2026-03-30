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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const public_service_1 = require("./public.service");
const swagger_1 = require("@nestjs/swagger");
const public_dto_1 = require("./dto/public.dto");
const order_dto_1 = require("../order/dto/order.dto");
const invoice_service_1 = require("../order/invoice.service");
let PublicController = class PublicController {
    publicService;
    invoiceService;
    constructor(publicService, invoiceService) {
        this.publicService = publicService;
        this.invoiceService = invoiceService;
    }
    async getOrderInvoice(id, res) {
        const buffer = await this.invoiceService.generateInvoicePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    getPublicOrder(id) {
        return this.publicService.getPublicOrder(id);
    }
    getTenant(id) {
        return this.publicService.getTenantBranding(id);
    }
    getBranches(id) {
        return this.publicService.getBranches(id);
    }
    async getMenu(tenantId, branchId) {
        const [tenant, categories] = await Promise.all([
            this.publicService.getTenantBranding(tenantId),
            this.publicService.getMenu(tenantId, branchId)
        ]);
        return { tenant, categories };
    }
    createOrder(tenantId, dto) {
        return this.publicService.createGuestOrder(tenantId, dto);
    }
    generateQr(tenantId, tableId) {
        return this.publicService.generateTableQr(tenantId, tableId);
    }
    createFeedback(id, dto) {
        return this.publicService.createOrderFeedback(id, dto);
    }
    getTableOrder(tableId) {
        return this.publicService.getTableOrder(tableId);
    }
    getTable(id) {
        return this.publicService.getTable(id);
    }
    splitOrder(id, dto) {
        return this.publicService.splitOrder(id, dto);
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('order/:id/invoice'),
    (0, swagger_1.ApiOperation)({ summary: 'Download order invoice as PDF (Public)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getOrderInvoice", null);
__decorate([
    (0, common_1.Get)('order/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order details for guests' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getPublicOrder", null);
__decorate([
    (0, common_1.Get)('tenant/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get restaurant branding and settings' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getTenant", null);
__decorate([
    (0, common_1.Get)('tenant/:id/branches'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active branches for a restaurant' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getBranches", null);
__decorate([
    (0, common_1.Get)('menu/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public menu categories and products' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getMenu", null);
__decorate([
    (0, common_1.Post)('order/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new guest order' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, public_dto_1.CreatePublicOrderDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('qr/:tenantId/:tableId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate QR code for a specific table' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('tableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "generateQr", null);
__decorate([
    (0, common_1.Post)('order/:id/feedback'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit feedback for an order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "createFeedback", null);
__decorate([
    (0, common_1.Get)('table/:tableId/order'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active order for a table (Public)' }),
    __param(0, (0, common_1.Param)('tableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getTableOrder", null);
__decorate([
    (0, common_1.Get)('table/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get table details (Public)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getTable", null);
__decorate([
    (0, common_1.Post)('order/:orderId/split'),
    (0, swagger_1.ApiOperation)({ summary: 'Split an order (Public)' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.SplitBillDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "splitOrder", null);
exports.PublicController = PublicController = __decorate([
    (0, swagger_1.ApiTags)('Public Menu'),
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [public_service_1.PublicService,
        invoice_service_1.InvoiceService])
], PublicController);
//# sourceMappingURL=public.controller.js.map