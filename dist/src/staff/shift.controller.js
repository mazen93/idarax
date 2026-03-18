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
exports.ShiftController = void 0;
const common_1 = require("@nestjs/common");
const shift_service_1 = require("./shift.service");
const shift_dto_1 = require("./dto/shift.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const permissions_constants_1 = require("../auth/permissions.constants");
const swagger_1 = require("@nestjs/swagger");
let ShiftController = class ShiftController {
    shiftService;
    constructor(shiftService) {
        this.shiftService = shiftService;
    }
    clockIn(req, dto) {
        return this.shiftService.clockIn(req.user.id, dto);
    }
    clockOut(req, dto) {
        return this.shiftService.clockOut(req.user.id, dto);
    }
    startBreak(req, dto) {
        return this.shiftService.startBreak(req.user.id, dto);
    }
    endBreak(req) {
        return this.shiftService.endBreak(req.user.id);
    }
    getCurrent(req) {
        return this.shiftService.getCurrentShift(req.user.id);
    }
    getAll(from, to, branchId) {
        return this.shiftService.getAllShifts(from ? new Date(from) : undefined, to ? new Date(to) : undefined, branchId);
    }
};
exports.ShiftController = ShiftController;
__decorate([
    (0, common_1.Post)('clock-in'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Staff clock in' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shift_dto_1.ClockInDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "clockIn", null);
__decorate([
    (0, common_1.Post)('clock-out'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Staff clock out' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shift_dto_1.ClockOutDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "clockOut", null);
__decorate([
    (0, common_1.Post)('break/start'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Start a break' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shift_dto_1.StartBreakDto]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "startBreak", null);
__decorate([
    (0, common_1.Post)('break/end'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'End a break' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "endBreak", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active shift for logged in user' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get all shifts for the tenant' }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ShiftController.prototype, "getAll", null);
exports.ShiftController = ShiftController = __decorate([
    (0, swagger_1.ApiTags)('Staff'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('staff/shifts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [shift_service_1.ShiftService])
], ShiftController);
//# sourceMappingURL=shift.controller.js.map