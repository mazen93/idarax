import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const tenantId = client.handshake.headers['x-tenant-id'] as string;
    if (tenantId) {
      client.join(`tenant:${tenantId}`);
    }
  }

  handleDisconnect(_client: Socket) {
    // Rooms are cleaned up automatically
  }

  /** Broadcast a notification to all dashboard tabs for this tenant */
  notifyTenant(tenantId: string, notification: any) {
    this.server.to(`tenant:${tenantId}`).emit('notification', notification);
  }
}
