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
exports.ClockOutDto = exports.StartBreakDto = exports.ClockInDto = exports.BreakType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var BreakType;
(function (BreakType) {
    BreakType["LUNCH"] = "LUNCH";
    BreakType["SHORT"] = "SHORT";
    BreakType["OTHER"] = "OTHER";
})(BreakType || (exports.BreakType = BreakType = {}));
class ClockInDto {
    note;
    branchId;
}
exports.ClockInDto = ClockInDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClockInDto.prototype, "note", void 0);
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
], ClockInDto.prototype, "branchId", void 0);
class StartBreakDto {
    type;
}
exports.StartBreakDto = StartBreakDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BreakType }),
    (0, class_validator_1.IsEnum)(BreakType),
    __metadata("design:type", String)
], StartBreakDto.prototype, "type", void 0);
class ClockOutDto {
    note;
}
exports.ClockOutDto = ClockOutDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClockOutDto.prototype, "note", void 0);
//# sourceMappingURL=shift.dto.js.map