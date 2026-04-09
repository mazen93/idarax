"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZatcaTlvService = void 0;
const common_1 = require("@nestjs/common");
let ZatcaTlvService = class ZatcaTlvService {
    encode(tags) {
        const buffers = [];
        tags.forEach((value, index) => {
            const tagId = index + 1;
            const valueBuffer = Buffer.isBuffer(value) ? value : Buffer.from(value.toString(), 'utf8');
            const tagIdBuffer = Buffer.alloc(1);
            tagIdBuffer.writeUInt8(tagId, 0);
            const lengthBuffer = Buffer.alloc(1);
            lengthBuffer.writeUInt8(valueBuffer.length, 0);
            buffers.push(tagIdBuffer, lengthBuffer, valueBuffer);
        });
        return Buffer.concat(buffers).toString('base64');
    }
    getPhase1TLV(sellerName, vatNumber, timestamp, totalWithVat, vatAmount) {
        return this.encode([
            sellerName,
            vatNumber,
            timestamp,
            totalWithVat,
            vatAmount
        ]);
    }
};
exports.ZatcaTlvService = ZatcaTlvService;
exports.ZatcaTlvService = ZatcaTlvService = __decorate([
    (0, common_1.Injectable)()
], ZatcaTlvService);
//# sourceMappingURL=zatca-tlv.service.js.map