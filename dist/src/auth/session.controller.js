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
exports.SessionController = void 0;
const common_1 = require("@nestjs/common");
const session_service_1 = require("./session.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
let SessionController = class SessionController {
    sessionService;
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    getMySessions(req) {
        return this.sessionService.getUserSessions(req.user.id);
    }
    revokeAll(req) {
        return this.sessionService.revokeAllSessions(req.user.id);
    }
    revokeOne(jti, req) {
        return this.sessionService.revokeSession(jti, req.user.id);
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all active sessions (devices) for the authenticated user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SessionController.prototype, "getMySessions", null);
__decorate([
    (0, common_1.Delete)('all'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Logout from all devices (revoke all sessions)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All sessions revoked.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SessionController.prototype, "revokeAll", null);
__decorate([
    (0, common_1.Delete)(':jti'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke a specific session by its JTI (logout from one device)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session revoked.' }),
    __param(0, (0, common_1.Param)('jti')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SessionController.prototype, "revokeOne", null);
exports.SessionController = SessionController = __decorate([
    (0, swagger_1.ApiTags)('Sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Controller)('auth/sessions'),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], SessionController);
//# sourceMappingURL=session.controller.js.map