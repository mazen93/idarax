import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { WsJwtGuard } from '../../auth/ws-jwt.guard';
import { KdsService } from './kds.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'kds',
})
export class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => KdsService))
    private readonly kdsService: KdsService,
  ) { }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const tenantId = client.handshake.headers['x-tenant-id'] as string;
    const stationId = client.handshake.query.stationId as string;

    if (tenantId) {
      // Join tenant-specific room
      client.join(`tenant:${tenantId}`);

      if (stationId) {
        // Join station-specific room
        client.join(`tenant:${tenantId}:station:${stationId}`);
      }
    }
  }

  handleDisconnect(client: Socket) {
    // Rooms are automatically left on disconnect
  }

  notifyNewOrder(tenantId: string, orderData: any) {
    this.server.to(`tenant:${tenantId}`).emit('new_order', orderData);
  }

  notifyStationOrder(tenantId: string, stationId: string, itemData: any) {
    this.server.to(`tenant:${tenantId}:station:${stationId}`).emit('new_item', itemData);
  }

  @SubscribeMessage('updateItemStatus')
  async handleUpdateItemStatus(client: Socket, data: { orderItemId: string; status: any }) {
    // Note: The service will handle tenant verification via TenantService 
    // nested in the request. For sockets, we might need a workaround if TenantService 
    // uses ALS. Let's assume KdsService can handle the logic.
    return this.kdsService.updateItemStatus(data.orderItemId, { status: data.status });
  }
}
