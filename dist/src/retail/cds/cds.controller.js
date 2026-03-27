"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const pusher_service_1 = require("../../notifications/pusher.service");
const ai_service_1 = require("../../analytics/ai/ai.service");
const feature_gate_guard_1 = require("../../common/guards/feature-gate.guard");
const express = __importStar(require("express"));
let CdsController = class CdsController {
    pusherService;
    aiService;
    constructor(pusherService, aiService) {
        this.pusherService = pusherService;
        this.aiService = aiService;
    }
    async syncCart(req, data) {
        const branchId = req.user?.branchId || data.branchId;
        if (!branchId) {
            return { success: false, message: 'Branch ID is required for CDS sync' };
        }
        let recommendations = [];
        const tenantId = req.user?.tenantId;
        if (data.items && data.items.length > 0) {
            try {
                const productIds = data.items.map((item) => item.productId);
                recommendations = await this.aiService.getUpsellRecommendations(productIds);
            }
            catch (error) {
            }
        }
        const channel = `private-cds-${branchId}`;
        await this.pusherService.trigger(channel, 'cds_cart_updated', {
            ...data,
            recommendations
        });
        return { success: true, message: 'Cart synced to CDS with AI suggestions' };
    }
    async checkoutState(req, data) {
        const branchId = req.user?.branchId || data.branchId;
        if (!branchId) {
            return { success: false, message: 'Branch ID is required for CDS checkout' };
        }
        const channel = `private-cds-${branchId}`;
        await this.pusherService.trigger(channel, 'cds_checkout_status', data);
        return { success: true, message: 'Checkout status synced to CDS' };
    }
};
exports.CdsController = CdsController;
__decorate([
    (0, common_1.Post)('sync-cart'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CdsController.prototype, "syncCart", null);
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CdsController.prototype, "checkoutState", null);
exports.CdsController = CdsController = __decorate([
    (0, common_1.Controller)('retail/cds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, feature_gate_guard_1.FeatureGateGuard),
    __metadata("design:paramtypes", [pusher_service_1.PusherService,
        ai_service_1.AiService])
], CdsController);
//# sourceMappingURL=cds.controller.js.map