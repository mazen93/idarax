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
exports.TableSectionController = void 0;
const common_1 = require("@nestjs/common");
const table_section_service_1 = require("./table-section.service");
const table_section_dto_1 = require("./dto/table-section.dto");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../../auth/permissions.decorator");
const permissions_constants_1 = require("../../../auth/permissions.constants");
const subscription_decorator_1 = require("../../../auth/subscription.decorator");
const subscription_guard_1 = require("../../../auth/subscription.guard");
let TableSectionController = class TableSectionController {
    sectionService;
    constructor(sectionService) {
        this.sectionService = sectionService;
    }
    create(dto) {
        return this.sectionService.create(dto);
    }
    findAll() {
        return this.sectionService.findAll();
    }
    findOne(id) {
        return this.sectionService.findOne(id);
    }
    update(id, dto) {
        return this.sectionService.update(id, dto);
    }
    remove(id) {
        return this.sectionService.remove(id);
    }
};
exports.TableSectionController = TableSectionController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MANAGE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [table_section_dto_1.CreateTableSectionDto]),
    __metadata("design:returntype", void 0)
], TableSectionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.VIEW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TableSectionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.VIEW),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TableSectionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MANAGE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, table_section_dto_1.UpdateTableSectionDto]),
    __metadata("design:returntype", void 0)
], TableSectionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MANAGE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TableSectionController.prototype, "remove", null);
exports.TableSectionController = TableSectionController = __decorate([
    (0, common_1.Controller)('restaurant/table-sections'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_decorator_1.RequiresFeature)('RESTAURANT'),
    __metadata("design:paramtypes", [table_section_service_1.TableSectionService])
], TableSectionController);
//# sourceMappingURL=table-section.controller.js.map