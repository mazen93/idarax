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
exports.CrmController = void 0;
const common_1 = require("@nestjs/common");
const crm_service_1 = require("./crm.service");
const crm_dto_1 = require("./dto/crm.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const permissions_constants_1 = require("../auth/permissions.constants");
let CrmController = class CrmController {
    crmService;
    constructor(crmService) {
        this.crmService = crmService;
    }
    create(dto) {
        return this.crmService.createCustomer(dto);
    }
    findAll(query) {
        return this.crmService.getCustomers(query);
    }
    findOne(id) {
        return this.crmService.getCustomerById(id);
    }
    update(id, dto) {
        return this.crmService.updateCustomer(id, dto);
    }
    delete(id) {
        return this.crmService.deleteCustomer(id);
    }
    addTransaction(dto) {
        return this.crmService.addLoyaltyTransaction(dto);
    }
    createAddress(dto) {
        return this.crmService.createAddress(dto);
    }
    updateAddress(id, dto) {
        return this.crmService.updateAddress(id, dto);
    }
    deleteAddress(id) {
        return this.crmService.deleteAddress(id);
    }
    getActiveCampaigns() {
        return this.crmService.getActiveCampaigns();
    }
};
exports.CrmController = CrmController;
__decorate([
    (0, common_1.Post)('customers'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('customers'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.VIEW),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('customers/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.VIEW),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('customers/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('customers/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('loyalty/transaction'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.EDIT),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.LoyaltyTransactionDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "addTransaction", null);
__decorate([
    (0, common_1.Post)('addresses'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.EDIT),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.CreateCustomerAddressDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createAddress", null);
__decorate([
    (0, common_1.Patch)('addresses/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.UpdateCustomerAddressDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)('addresses/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteAddress", null);
__decorate([
    (0, common_1.Get)('campaigns/active'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.VIEW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getActiveCampaigns", null);
exports.CrmController = CrmController = __decorate([
    (0, common_1.Controller)('crm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [crm_service_1.CrmService])
], CrmController);
//# sourceMappingURL=crm.controller.js.map