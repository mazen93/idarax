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
exports.UpdateAuditDto = exports.AuditItemUpdateDto = exports.StartAuditDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class StartAuditDto {
    warehouseId;
    productIds;
}
exports.StartAuditDto = StartAuditDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'warehouse-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StartAuditDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], required: false, description: 'Optional list of product IDs to audit. If empty, all products in warehouse will be included.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StartAuditDto.prototype, "productIds", void 0);
class AuditItemUpdateDto {
    productId;
    physicalQuantity;
}
exports.AuditItemUpdateDto = AuditItemUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuditItemUpdateDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AuditItemUpdateDto.prototype, "physicalQuantity", void 0);
class UpdateAuditDto {
    items;
}
exports.UpdateAuditDto = UpdateAuditDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AuditItemUpdateDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AuditItemUpdateDto),
    __metadata("design:type", Array)
], UpdateAuditDto.prototype, "items", void 0);
//# sourceMappingURL=audit.dto.js.map