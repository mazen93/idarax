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
exports.AddMovementDto = exports.CashMovementType = exports.CloseDrawerDto = exports.OpenDrawerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class OpenDrawerDto {
    openingBalance;
    note;
    branchId;
}
exports.OpenDrawerDto = OpenDrawerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Starting cash balance in drawer' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], OpenDrawerDto.prototype, "openingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpenDrawerDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value || value === '' || value === 'null' || value === 'undefined')
            return undefined;
        return value;
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpenDrawerDto.prototype, "branchId", void 0);
class CloseDrawerDto {
    closingBalance;
    note;
}
exports.CloseDrawerDto = CloseDrawerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Physically counted cash balance at close' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CloseDrawerDto.prototype, "closingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CloseDrawerDto.prototype, "note", void 0);
var CashMovementType;
(function (CashMovementType) {
    CashMovementType["CASH_IN"] = "CASH_IN";
    CashMovementType["CASH_OUT"] = "CASH_OUT";
})(CashMovementType || (exports.CashMovementType = CashMovementType = {}));
class AddMovementDto {
    amount;
    type;
    reason;
}
exports.AddMovementDto = AddMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Positive amount only — direction controlled by type' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], AddMovementDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CashMovementType }),
    (0, class_validator_1.IsEnum)(CashMovementType),
    __metadata("design:type", String)
], AddMovementDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddMovementDto.prototype, "reason", void 0);
//# sourceMappingURL=drawer.dto.js.map