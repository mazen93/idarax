"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("./jwt.strategy");
const prisma_module_1 = require("../prisma/prisma.module");
const token_blacklist_service_1 = require("./token-blacklist.service");
const audit_log_module_1 = require("../common/audit-log/audit-log.module");
const session_service_1 = require("./session.service");
const session_controller_1 = require("./session.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secretKey',
                signOptions: { expiresIn: '1h' },
            }),
            prisma_module_1.PrismaModule,
            audit_log_module_1.AuditLogModule,
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, token_blacklist_service_1.TokenBlacklistService, session_service_1.SessionService],
        controllers: [auth_controller_1.AuthController, session_controller_1.SessionController],
        exports: [token_blacklist_service_1.TokenBlacklistService, session_service_1.SessionService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map