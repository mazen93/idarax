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
exports.NumberingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NumberingService = class NumberingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getBusinessDate(timezone, startHour = 0) {
        const now = new Date();
        const adjusted = new Date(now.getTime() - startHour * 60 * 60 * 1000);
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        return formatter.format(adjusted).replace(/-/g, '');
    }
    async nextReceiptNumber(tx, tenantId, branchId, timezone, startHour = 0) {
        const date = this.getBusinessDate(timezone, startHour);
        const result = await tx.$queryRaw `
            INSERT INTO "ReceiptCounter" (id, "tenantId", "branchId", date, sequence)
            VALUES (gen_random_uuid()::text, ${tenantId}, ${branchId}, ${date}, 1)
            ON CONFLICT ("tenantId", "branchId", date)
            DO UPDATE SET
                sequence = CASE
                    WHEN "ReceiptCounter".sequence >= 999 THEN 1
                    ELSE "ReceiptCounter".sequence + 1
                END
            RETURNING sequence
        `;
        return Number(result[0].sequence);
    }
    async nextInvoiceNumber(tx, tenantId, timezone, branchId = null, startHour = 0) {
        const date = this.getBusinessDate(timezone, startHour);
        const now = new Date();
        const timeFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const time = timeFormatter.format(now).replace(/:/g, '');
        const suffix = branchId ? branchId.slice(-4).toUpperCase() : '0000';
        const result = await tx.$queryRaw `
            INSERT INTO "InvoiceCounter" (id, "tenantId", date, sequence)
            VALUES (gen_random_uuid()::text, ${tenantId}, ${date}, 1)
            ON CONFLICT ("tenantId", date)
            DO UPDATE SET sequence = "InvoiceCounter".sequence + 1
            RETURNING sequence
        `;
        const seq = Number(result[0].sequence);
        return `INV-${date}-${time}-${suffix}-${String(seq).padStart(4, '0')}`;
    }
};
exports.NumberingService = NumberingService;
exports.NumberingService = NumberingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NumberingService);
//# sourceMappingURL=numbering.service.js.map