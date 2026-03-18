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
exports.TableController = void 0;
const common_1 = require("@nestjs/common");
const table_service_1 = require("./table.service");
const table_dto_1 = require("./dto/table.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let TableController = class TableController {
    tableService;
    constructor(tableService) {
        this.tableService = tableService;
    }
    create(dto) {
        return this.tableService.create(dto);
    }
    findAll() {
        return this.tableService.findAll();
    }
    findOne(id) {
        return this.tableService.findOne(id);
    }
    update(id, dto) {
        return this.tableService.update(id, dto);
    }
    moveOrder(id, targetTableId) {
        return this.tableService.moveOrder(id, targetTableId);
    }
    merge(id, targetTableId) {
        return this.tableService.mergeTables(id, targetTableId);
    }
    unmerge(id) {
        return this.tableService.unmergeTable(id);
    }
    checkout(id) {
        return this.tableService.checkout(id);
    }
    remove(id) {
        return this.tableService.remove(id);
    }
};
exports.TableController = TableController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MANAGE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [table_dto_1.CreateTableDto]),
    __metadata("design:returntype", void 0)
], TableController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.VIEW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TableController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.VIEW),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TableController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MANAGE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, table_dto_1.UpdateTableDto]),
    __metadata("design:returntype", void 0)
], TableController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/move-order'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.TRANSFER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('targetTableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TableController.prototype, "moveOrder", null);
__decorate([
    (0, common_1.Post)(':id/merge'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MERGE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('targetTableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TableController.prototype, "merge", null);
__decorate([
    (0, common_1.Post)(':id/unmerge'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MERGE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TableController.prototype, "unmerge", null);
__decorate([
    (0, common_1.Post)(':id/checkout'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MANAGE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TableController.prototype, "checkout", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.TABLES.MANAGE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TableController.prototype, "remove", null);
exports.TableController = TableController = __decorate([
    (0, common_1.Controller)('restaurant/tables'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [table_service_1.TableService])
], TableController);
//# sourceMappingURL=table.controller.js.map