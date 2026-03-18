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
exports.KdsController = void 0;
const common_1 = require("@nestjs/common");
const kds_service_1 = require("./kds.service");
const kds_dto_1 = require("./dto/kds.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let KdsController = class KdsController {
    kdsService;
    constructor(kdsService) {
        this.kdsService = kdsService;
    }
    createStation(dto) {
        return this.kdsService.createStation(dto);
    }
    getStations() {
        return this.kdsService.getStations();
    }
    getStationItems(id) {
        return this.kdsService.getStationItems(id);
    }
    updateItemStatus(id, dto) {
        return this.kdsService.updateItemStatus(id, dto);
    }
    assignStaff(id, dto) {
        return this.kdsService.assignStaff(id, dto);
    }
};
exports.KdsController = KdsController;
__decorate([
    (0, common_1.Post)('stations'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.SETTINGS.EDIT),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [kds_dto_1.CreateKitchenStationDto]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "createStation", null);
__decorate([
    (0, common_1.Get)('stations'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.KDS.ACCESS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "getStations", null);
__decorate([
    (0, common_1.Get)('stations/:id/items'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.KDS.ACCESS),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "getStationItems", null);
__decorate([
    (0, common_1.Patch)('items/:id/status'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.KDS.ACCESS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, kds_dto_1.UpdateOrderItemStatusDto]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "updateItemStatus", null);
__decorate([
    (0, common_1.Post)('stations/:id/staff'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.SETTINGS.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, kds_dto_1.AssignStaffDto]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "assignStaff", null);
exports.KdsController = KdsController = __decorate([
    (0, common_1.Controller)('restaurant/kds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [kds_service_1.KdsService])
], KdsController);
//# sourceMappingURL=kds.controller.js.map