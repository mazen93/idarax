import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'cds',
})
export class CdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        const tenantId = client.handshake.headers['x-tenant-id'] as string;
        const terminalId = client.handshake.query.terminalId as string;
        if (tenantId) {
            client.join(`cds:${tenantId}`);
            if (terminalId) {
                client.join(`cds:${tenantId}:${terminalId}`);
            }
        }
    }

    handleDisconnect(_client: Socket) { }

    // Broadcast cart session update to CDS tablet for a specific terminal
    broadcastCartUpdate(tenantId: string, terminalId: string, payload: any) {
        this.server.to(`cds:${tenantId}:${terminalId}`).emit('cart_updated', payload);
    }

    broadcastPaymentProcessing(tenantId: string, terminalId: string) {
        this.server.to(`cds:${tenantId}:${terminalId}`).emit('payment_processing', {});
    }

    broadcastOrderComplete(tenantId: string, terminalId: string, payload: any) {
        this.server.to(`cds:${tenantId}:${terminalId}`).emit('order_complete', payload);
    }

    broadcastSessionCleared(tenantId: string, terminalId: string) {
        this.server.to(`cds:${tenantId}:${terminalId}`).emit('session_cleared', {});
    }
}
