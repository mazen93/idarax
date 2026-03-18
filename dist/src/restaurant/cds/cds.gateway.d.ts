import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class CdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(_client: Socket): void;
    broadcastCartUpdate(tenantId: string, terminalId: string, payload: any): void;
    broadcastPaymentProcessing(tenantId: string, terminalId: string): void;
    broadcastOrderComplete(tenantId: string, terminalId: string, payload: any): void;
    broadcastSessionCleared(tenantId: string, terminalId: string): void;
}
