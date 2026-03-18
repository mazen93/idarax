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
exports.CdsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let CdsGateway = class CdsGateway {
    server;
    handleConnection(client) {
        const tenantId = client.handshake.headers['x-tenant-id'];
        const terminalId = client.handshake.query.terminalId;
        if (tenantId) {
            client.join(`cds:${tenantId}`);
            if (terminalId) {
                client.join(`cds:${tenantId}:${terminalId}`);
            }
        }
    }
    handleDisconnect(_client) { }
    broadcastCartUpdate(tenantId, terminalId, payload) {
        this.server.to(`cds:${tenantId}:${terminalId}`).emit('cart_updated', payload);
    }
    broadcastPaymentProcessing(tenantId, terminalId) {
        this.server.to(`cds:${tenantId}:${terminalId}`).emit('payment_processing', {});
    }
    broadcastOrderComplete(tenantId, terminalId, payload) {
        this.server.to(`cds:${tenantId}:${terminalId}`).emit('order_complete', payload);
    }
    broadcastSessionCleared(tenantId, terminalId) {
        this.server.to(`cds:${tenantId}:${terminalId}`).emit('session_cleared', {});
    }
};
exports.CdsGateway = CdsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CdsGateway.prototype, "server", void 0);
exports.CdsGateway = CdsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: 'cds',
    })
], CdsGateway);
//# sourceMappingURL=cds.gateway.js.map