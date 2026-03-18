import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { KdsService } from './kds.service';
export declare class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly kdsService;
    constructor(kdsService: KdsService);
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    notifyNewOrder(tenantId: string, orderData: any): void;
    notifyStationOrder(tenantId: string, stationId: string, itemData: any): void;
    handleUpdateItemStatus(client: Socket, data: {
        orderItemId: string;
        status: any;
    }): Promise<any>;
}
