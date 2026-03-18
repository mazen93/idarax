"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const async_hooks_1 = require("async_hooks");
let TenantService = class TenantService {
    als = new async_hooks_1.AsyncLocalStorage();
    setContext(tenantId, branchId) {
        this.als.enterWith({ tenantId, branchId });
    }
    setTenantId(tenantId) {
        const store = this.als.getStore();
        this.als.enterWith({ ...store, tenantId });
    }
    setBranchId(branchId) {
        const store = this.als.getStore();
        if (store) {
            this.als.enterWith({ ...store, branchId });
        }
    }
    getTenantId() {
        return this.als.getStore()?.tenantId;
    }
    getBranchId() {
        return this.als.getStore()?.branchId;
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)()
], TenantService);
//# sourceMappingURL=tenant.service.js.map