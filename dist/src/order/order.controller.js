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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const refund_service_1 = require("./refund.service");
const invoice_service_1 = require("./invoice.service");
const order_dto_1 = require("./dto/order.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const permissions_constants_1 = require("../auth/permissions.constants");
const swagger_1 = require("@nestjs/swagger");
let OrderController = class OrderController {
    orderService;
    refundService;
    invoiceService;
    constructor(orderService, refundService, invoiceService) {
        this.orderService = orderService;
        this.refundService = refundService;
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
    create(req, dto) {
        return this.orderService.createAsync(dto, req.user.id);
    }
    findAll(start, end) {
        let startDate;
        let endDate;
        if (start) {
            const d = new Date(start);
            if (!isNaN(d.getTime()))
                startDate = d;
        }
        if (end) {
            const d = new Date(end);
            if (!isNaN(d.getTime())) {
                d.setUTCHours(23, 59, 59, 999);
                endDate = d;
            }
        }
        return this.orderService.findAll(startDate, endDate);
    }
    lookupByReceipt(receiptNumber, date, branchId) {
        return this.orderService.lookupByReceipt(Number(receiptNumber), date, branchId);
    }
    createDirect(req, dto) {
        return this.orderService.createDirect({ ...dto, userId: req.user.id });
    }
    updateStatus(id, body) {
        return this.orderService.updateStatus(id, body.status);
    }
    assignTable(id, body) {
        return this.orderService.assignTable(id, body.tableId);
    }
    findActiveByTable(tableId) {
        return this.orderService.findActiveByTable(tableId);
    }
    split(dto) {
        return this.orderService.splitBill(dto);
    }
    findOne(id) {
        return this.orderService.getOrder(id);
    }
    refundOrder(id, body) {
        return this.refundService.refundOrder(id, body.reason);
    }
    refundItem(id, itemId, body) {
        return this.refundService.refundItem(itemId, body.quantity, body.reason);
    }
    holdOrder(id) {
        return this.orderService.holdOrder(id);
    }
    fireOrder(id) {
        return this.orderService.fireOrder(id);
    }
    voidOrder(id, body) {
        return this.orderService.voidOrder(id, body.managerPin);
    }
    voidItem(id, itemId) {
        return this.orderService.voidItem(id, itemId);
    }
    repeatOrder(id) {
        return this.orderService.repeatOrder({ orderId: id });
    }
    sendReceipt(id, dto) {
        return this.orderService.sendReceipt(id, dto.email);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Get)(':id/invoice'),
    (0, permissions_decorator_1.Permissions)('orders:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderInvoice", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CREATE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.VIEW_ALL),
    (0, swagger_1.ApiOperation)({ summary: 'List all orders for the tenant' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('lookup'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Find an order by receipt number + business date + branch (for reprint / audit)' }),
    __param(0, (0, common_1.Query)('receiptNumber')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "lookupByReceipt", null);
__decorate([
    (0, common_1.Post)('direct'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create order synchronously (POS / cashier flow)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "createDirect", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status (KDS actions)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/table'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MANAGE),
    (0, swagger_1.ApiOperation)({ summary: 'Assign order to a table' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "assignTable", null);
__decorate([
    (0, common_1.Get)('table/:tableId/active'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get active order for a table' }),
    __param(0, (0, common_1.Param)('tableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findActiveByTable", null);
__decorate([
    (0, common_1.Post)('split'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Split an existing order into multiple sub-orders' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.SplitBillDto]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "split", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.VIEW),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.REFUND),
    (0, swagger_1.ApiOperation)({ summary: 'Refund entire order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "refundOrder", null);
__decorate([
    (0, common_1.Post)(':id/items/:itemId/refund'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.REFUND),
    (0, swagger_1.ApiOperation)({ summary: 'Refund specific order item' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "refundItem", null);
__decorate([
    (0, common_1.Patch)(':id/hold'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Park order (PENDING -> HELD)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "holdOrder", null);
__decorate([
    (0, common_1.Patch)(':id/fire'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Send held order to kitchen (HELD -> PREPARING)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "fireOrder", null);
__decorate([
    (0, common_1.Patch)(':id/void'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CANCEL),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel order with manager PIN authorization' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "voidOrder", null);
__decorate([
    (0, common_1.Patch)(':id/void-item/:itemId'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CANCEL),
    (0, swagger_1.ApiOperation)({ summary: 'Void a single specific item' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "voidItem", null);
__decorate([
    (0, common_1.Post)(':id/repeat'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Clone a previous order' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "repeatOrder", null);
__decorate([
    (0, common_1.Post)(':id/receipt'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Send order receipt to email' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.SendReceiptDto]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "sendReceipt", null);
exports.OrderController = OrderController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        refund_service_1.RefundService,
        invoice_service_1.InvoiceService])
], OrderController);
//# sourceMappingURL=order.controller.js.map