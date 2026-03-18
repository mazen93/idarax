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
exports.KdsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const kds_service_1 = require("./kds.service");
let KdsGateway = class KdsGateway {
    kdsService;
    constructor(kdsService) {
        this.kdsService = kdsService;
    }
    server;
    handleConnection(client) {
        const tenantId = client.handshake.headers['x-tenant-id'];
        const stationId = client.handshake.query.stationId;
        if (tenantId) {
            client.join(`tenant:${tenantId}`);
            if (stationId) {
                client.join(`tenant:${tenantId}:station:${stationId}`);
            }
        }
    }
    handleDisconnect(client) {
    }
    notifyNewOrder(tenantId, orderData) {
        this.server.to(`tenant:${tenantId}`).emit('new_order', orderData);
    }
    notifyStationOrder(tenantId, stationId, itemData) {
        this.server.to(`tenant:${tenantId}:station:${stationId}`).emit('new_item', itemData);
    }
    async handleUpdateItemStatus(client, data) {
        return this.kdsService.updateItemStatus(data.orderItemId, { status: data.status });
    }
};
exports.KdsGateway = KdsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], KdsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateItemStatus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], KdsGateway.prototype, "handleUpdateItemStatus", null);
exports.KdsGateway = KdsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: 'kds',
    }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => kds_service_1.KdsService))),
    __metadata("design:paramtypes", [kds_service_1.KdsService])
], KdsGateway);
//# sourceMappingURL=kds.gateway.js.map