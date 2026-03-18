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
exports.CdsController = void 0;
const common_1 = require("@nestjs/common");
const cds_service_1 = require("./cds.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let CdsController = class CdsController {
    cdsService;
    constructor(cdsService) {
        this.cdsService = cdsService;
    }
    updateCart(body) {
        return this.cdsService.updateCart(body);
    }
    startPayment(body) {
        return this.cdsService.startPayment(body);
    }
    completeOrder(body) {
        return this.cdsService.completeOrder(body);
    }
    clearSession(body) {
        return this.cdsService.clearSession(body);
    }
};
exports.CdsController = CdsController;
__decorate([
    (0, common_1.Post)('session/update'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.POS.ACCESS),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CdsController.prototype, "updateCart", null);
__decorate([
    (0, common_1.Post)('session/payment'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.POS.ACCESS),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CdsController.prototype, "startPayment", null);
__decorate([
    (0, common_1.Post)('session/complete'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.POS.ACCESS),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CdsController.prototype, "completeOrder", null);
__decorate([
    (0, common_1.Post)('session/clear'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.POS.ACCESS),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CdsController.prototype, "clearSession", null);
exports.CdsController = CdsController = __decorate([
    (0, common_1.Controller)('restaurant/cds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cds_service_1.CdsService])
], CdsController);
//# sourceMappingURL=cds.controller.js.map