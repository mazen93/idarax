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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PusherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PusherService = void 0;
const common_1 = require("@nestjs/common");
const pusher_1 = __importDefault(require("pusher"));
let PusherService = PusherService_1 = class PusherService {
    pusher;
    logger = new common_1.Logger(PusherService_1.name);
    constructor() {
        this.pusher = new pusher_1.default({
            appId: process.env.PUSHER_APP_ID || '1958543',
            key: process.env.PUSHER_KEY || '7d588279cd6a9ac136a1',
            secret: process.env.PUSHER_SECRET || '7ec1377f40ad8c6f29bc',
            cluster: process.env.PUSHER_CLUSTER || 'us2',
            host: process.env.PUSHER_HOST || 'mosaada.ae',
            port: process.env.PUSHER_PORT || '443',
            useTLS: true,
        });
    }
    async trigger(channel, event, data) {
        try {
            this.logger.log(`Triggering ${event} on ${channel}`);
            await this.pusher.trigger(channel, event, data);
        }
        catch (error) {
            this.logger.error(`Error triggering ${event} on ${channel}`, error);
        }
    }
};
exports.PusherService = PusherService;
exports.PusherService = PusherService = PusherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PusherService);
//# sourceMappingURL=pusher.service.js.map