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
exports.BranchSettingsController = void 0;
const common_1 = require("@nestjs/common");
const branch_settings_service_1 = require("./branch-settings.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
const branch_settings_dto_1 = require("./dto/branch-settings.dto");
let BranchSettingsController = class BranchSettingsController {
    branchSettingsService;
    constructor(branchSettingsService) {
        this.branchSettingsService = branchSettingsService;
    }
    getByBranch(branchId) {
        return this.branchSettingsService.getByBranch(branchId);
    }
    upsert(branchId, dto) {
        return this.branchSettingsService.upsert(branchId, dto);
    }
};
exports.BranchSettingsController = BranchSettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.SETTINGS.VIEW),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BranchSettingsController.prototype, "getByBranch", null);
__decorate([
    (0, common_1.Put)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.SETTINGS.EDIT),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, branch_settings_dto_1.UpdateBranchSettingsDto]),
    __metadata("design:returntype", void 0)
], BranchSettingsController.prototype, "upsert", null);
exports.BranchSettingsController = BranchSettingsController = __decorate([
    (0, common_1.Controller)('tenant/branches/:branchId/settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [branch_settings_service_1.BranchSettingsService])
], BranchSettingsController);
//# sourceMappingURL=branch-settings.controller.js.map