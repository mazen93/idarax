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
exports.UpdateBranchSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateBranchSettingsDto {
    isActive;
    taxRate;
    serviceFee;
    receiptHeader;
    receiptFooter;
    receiptLanguage;
    receiptShowCustomer;
    receiptShowLogo;
    receiptShowOrderNumber;
    receiptShowTable;
    receiptShowTimestamp;
    receiptShowOrderType;
    receiptShowOperator;
    receiptShowItemsDescription;
    receiptShowItemsQty;
    receiptShowItemsPrice;
    receiptShowSubtotal;
    receiptShowTax;
    receiptShowServiceCharge;
    receiptShowDiscount;
    receiptShowTotal;
    receiptShowPaymentMethod;
    receiptShowBarcode;
    preOrderEnabled;
    preOrderMaxDaysAhead;
    preOrderLeadMinutes;
}
exports.UpdateBranchSettingsDto = UpdateBranchSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 15 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBranchSettingsDto.prototype, "taxRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBranchSettingsDto.prototype, "serviceFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'Thank you for visiting!' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBranchSettingsDto.prototype, "receiptHeader", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'Please come again.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBranchSettingsDto.prototype, "receiptFooter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'en' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBranchSettingsDto.prototype, "receiptLanguage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowCustomer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowLogo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowOrderNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowTable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowOrderType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowOperator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowItemsDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowItemsQty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowItemsPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowSubtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowTax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowServiceCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowDiscount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowPaymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "receiptShowBarcode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Enable customers to schedule future orders from the web store', example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBranchSettingsDto.prototype, "preOrderEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'How many days ahead a customer can schedule (default 7)', example: 7 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBranchSettingsDto.prototype, "preOrderMaxDaysAhead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Minutes before scheduled time the kitchen is notified (default 30)', example: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBranchSettingsDto.prototype, "preOrderLeadMinutes", void 0);
//# sourceMappingURL=branch-settings.dto.js.map