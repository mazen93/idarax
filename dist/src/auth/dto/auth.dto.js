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
exports.VerifyOverrideDto = exports.RefreshTokenDto = exports.PinLoginDto = exports.LoginDto = exports.RegisterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RegisterDto {
    email;
    password;
    name;
    tenantId;
    role;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'tenant-123' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'STAFF' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@idarax.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class PinLoginDto {
    pin;
    tenantId;
}
exports.PinLoginDto = PinLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PinLoginDto.prototype, "pin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'tenant-id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PinLoginDto.prototype, "tenantId", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class VerifyOverrideDto {
    pin;
    tenantId;
    action;
}
exports.VerifyOverrideDto = VerifyOverrideDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyOverrideDto.prototype, "pin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'tenant-id' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyOverrideDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORDERS:REFUND' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyOverrideDto.prototype, "action", void 0);
//# sourceMappingURL=auth.dto.js.map