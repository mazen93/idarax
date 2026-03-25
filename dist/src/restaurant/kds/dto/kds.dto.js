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
exports.AssignStaffDto = exports.UpdateOrderItemStatusDto = exports.CreateOrderItemDto = exports.CreateKitchenStationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateKitchenStationDto {
    name;
    staffIds;
    branchId;
}
exports.CreateKitchenStationDto = CreateKitchenStationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateKitchenStationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateKitchenStationDto.prototype, "staffIds", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateKitchenStationDto.prototype, "branchId", void 0);
class CreateOrderItemDto {
    orderId;
    productId;
    quantity;
    price;
    stationId;
}
exports.CreateOrderItemDto = CreateOrderItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderItemDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderItemDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderItemDto.prototype, "stationId", void 0);
class UpdateOrderItemStatusDto {
    status;
    staff_pin;
}
exports.UpdateOrderItemStatusDto = UpdateOrderItemStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']),
    __metadata("design:type", String)
], UpdateOrderItemStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderItemStatusDto.prototype, "staff_pin", void 0);
class AssignStaffDto {
    staffIds;
}
exports.AssignStaffDto = AssignStaffDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], AssignStaffDto.prototype, "staffIds", void 0);
//# sourceMappingURL=kds.dto.js.map