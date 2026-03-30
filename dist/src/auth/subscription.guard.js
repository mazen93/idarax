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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const subscription_decorator_1 = require("./subscription.decorator");
let SubscriptionGuard = class SubscriptionGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredFeature = this.reflector.getAllAndOverride(subscription_decorator_1.FEATURES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredFeature) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Not authenticated');
        }
        if (user.isExpired && user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Your subscription has expired. Please renew your plan to continue.');
        }
        const features = user.features || [];
        const hasFeature = features.includes(requiredFeature);
        if (!hasFeature) {
            throw new common_1.ForbiddenException(`Your current subscription plan does not include the '${requiredFeature}' feature. Please upgrade to access this.`);
        }
        return true;
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map