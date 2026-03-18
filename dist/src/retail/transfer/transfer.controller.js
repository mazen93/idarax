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
exports.TransferController = void 0;
const common_1 = require("@nestjs/common");
const transfer_service_1 = require("./transfer.service");
const transfer_dto_1 = require("./dto/transfer.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let TransferController = class TransferController {
    transferService;
    constructor(transferService) {
        this.transferService = transferService;
    }
    create(dto) {
        return this.transferService.create(dto);
    }
    findAll() {
        return this.transferService.findAll();
    }
    updateStatus(id, dto) {
        return this.transferService.updateStatus(id, dto);
    }
};
exports.TransferController = TransferController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.TRANSFER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_dto_1.CreateTransferDto]),
    __metadata("design:returntype", void 0)
], TransferController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.VIEW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransferController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.TRANSFER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transfer_dto_1.UpdateTransferStatusDto]),
    __metadata("design:returntype", void 0)
], TransferController.prototype, "updateStatus", null);
exports.TransferController = TransferController = __decorate([
    (0, common_1.Controller)('retail/transfers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [transfer_service_1.TransferService])
], TransferController);
//# sourceMappingURL=transfer.controller.js.map