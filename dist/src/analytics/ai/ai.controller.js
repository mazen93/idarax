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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
const swagger_1 = require("@nestjs/swagger");
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    forecast(productId) {
        return this.aiService.forecastStock(productId);
    }
    recommendations(productId) {
        return this.aiService.getRecommendations(productId);
    }
    revenueForecast() {
        return this.aiService.predictRevenue(7);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)('forecast/:productId'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, swagger_1.ApiOperation)({ summary: 'Forecast stock depletion for a product' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "forecast", null);
__decorate([
    (0, common_1.Get)('recommendations/:productId'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, swagger_1.ApiOperation)({ summary: 'Get frequently bought together products' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "recommendations", null);
__decorate([
    (0, common_1.Get)('revenue-forecast'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, swagger_1.ApiOperation)({ summary: 'Predict revenue for next few days' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AiController.prototype, "revenueForecast", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI Insights'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('analytics/ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map