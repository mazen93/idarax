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
exports.SerialController = void 0;
const common_1 = require("@nestjs/common");
const serial_service_1 = require("./serial.service");
const serial_dto_1 = require("./dto/serial.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let SerialController = class SerialController {
    serialService;
    constructor(serialService) {
        this.serialService = serialService;
    }
    register(dto) {
        return this.serialService.register(dto);
    }
    findBySerial(serial) {
        return this.serialService.findBySerial(serial);
    }
    updateStatus(id, dto) {
        return this.serialService.updateStatus(id, dto);
    }
    findByProduct(productId) {
        return this.serialService.findByProduct(productId);
    }
};
exports.SerialController = SerialController;
__decorate([
    (0, common_1.Post)('register'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [serial_dto_1.RegisterSerialDto]),
    __metadata("design:returntype", void 0)
], SerialController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(':serial'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.VIEW),
    __param(0, (0, common_1.Param)('serial')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SerialController.prototype, "findBySerial", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.ADJUST),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, serial_dto_1.UpdateSerialStatusDto]),
    __metadata("design:returntype", void 0)
], SerialController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.VIEW),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SerialController.prototype, "findByProduct", null);
exports.SerialController = SerialController = __decorate([
    (0, common_1.Controller)('retail/serials'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [serial_service_1.SerialService])
], SerialController);
//# sourceMappingURL=serial.controller.js.map