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
exports.ImportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const import_service_1 = require("./import.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let ImportController = class ImportController {
    importService;
    constructor(importService) {
        this.importService = importService;
    }
    async importProducts(file, mode = 'SKIP_EXISTING') {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        return this.importService.importProducts(file, mode);
    }
    async importCustomers(file, mode = 'SKIP_EXISTING') {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        return this.importService.importCustomers(file, mode);
    }
};
exports.ImportController = ImportController;
__decorate([
    (0, common_1.Post)('products'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Import products from CSV/Excel' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "importProducts", null);
__decorate([
    (0, common_1.Post)('customers'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CUSTOMERS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Import customers from CSV/Excel' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "importCustomers", null);
exports.ImportController = ImportController = __decorate([
    (0, swagger_1.ApiTags)('Import'),
    (0, common_1.Controller)('import'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [import_service_1.ImportService])
], ImportController);
//# sourceMappingURL=import.controller.js.map