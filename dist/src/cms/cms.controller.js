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
exports.CmsController = void 0;
const common_1 = require("@nestjs/common");
const cms_service_1 = require("./cms.service");
const cms_dto_1 = require("./dto/cms.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let CmsController = class CmsController {
    cmsService;
    constructor(cmsService) {
        this.cmsService = cmsService;
    }
    getAllContent() {
        return this.cmsService.getAllContent();
    }
    getContentBySection(section) {
        return this.cmsService.getContentBySection(section);
    }
    getActivePlans() {
        return this.cmsService.getActivePlans();
    }
    selfRegister(dto) {
        return this.cmsService.selfRegister(dto);
    }
    upsertContent(section, dto) {
        return this.cmsService.upsertContent(section, dto);
    }
    deleteContent(section) {
        return this.cmsService.deleteContent(section);
    }
    getAllPlans() {
        return this.cmsService.getAllPlans();
    }
    createPlan(dto) {
        return this.cmsService.createPlan(dto);
    }
    updatePlan(id, dto) {
        return this.cmsService.updatePlan(id, dto);
    }
    deletePlan(id) {
        return this.cmsService.deletePlan(id);
    }
};
exports.CmsController = CmsController;
__decorate([
    (0, common_1.Get)('content'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all landing page sections (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getAllContent", null);
__decorate([
    (0, common_1.Get)('content/:section'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific section (public)' }),
    __param(0, (0, common_1.Param)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getContentBySection", null);
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active subscription plans (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getActivePlans", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Self-register a new tenant (public)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cms_dto_1.SelfRegisterDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "selfRegister", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('content/:section'),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert a landing page section (superadmin)' }),
    __param(0, (0, common_1.Param)('section')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cms_dto_1.UpsertLandingContentDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "upsertContent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('content/:section'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a landing page section (superadmin)' }),
    __param(0, (0, common_1.Param)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "deleteContent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all plans including inactive (superadmin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "getAllPlans", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a subscription plan (superadmin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cms_dto_1.CreatePlanDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "createPlan", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('plans/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subscription plan (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cms_dto_1.UpdatePlanDto]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('plans/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a subscription plan (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CmsController.prototype, "deletePlan", null);
exports.CmsController = CmsController = __decorate([
    (0, swagger_1.ApiTags)('Landing Page CMS'),
    (0, common_1.Controller)('cms'),
    __metadata("design:paramtypes", [cms_service_1.CmsService])
], CmsController);
//# sourceMappingURL=cms.controller.js.map