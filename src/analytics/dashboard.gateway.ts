import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'dashboard',
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const tenantId = client.handshake.headers['x-tenant-id'] as string;
    const branchId = client.handshake.query.branchId as string;

    if (tenantId) {
      // Join tenant-specific dashboard room
      client.join(`tenant:${tenantId}:dashboard`);
      
      if (branchId && branchId !== 'all') {
        // Join branch-specific dashboard room
        client.join(`tenant:${tenantId}:branch:${branchId}:dashboard`);
      }
    }
  }

  handleDisconnect(client: Socket) {
    // Left automatically
  }

  /**
   * Broadcast real-time stat updates to connected managers/dashboards
   */
  emitStatsUpdate(tenantId: string, branchId: string | null, stats: any) {
    // Broadcast to the whole tenant
    this.server.to(`tenant:${tenantId}:dashboard`).emit('stats_updated', stats);
    
    // Also broadcast to the specific branch if applicable
    if (branchId) {
      this.server.to(`tenant:${tenantId}:branch:${branchId}:dashboard`).emit('stats_updated', stats);
    }
  }
}
