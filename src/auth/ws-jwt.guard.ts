import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient<Socket>();
        const authHeader = client.handshake.headers.authorization;

        if (!authHeader) return false;

        const token = authHeader.split(' ')[1];
        try {
            const payload = await this.jwtService.verifyAsync(token);
            (client as any).user = payload;
            return true;
        } catch {
            return false;
        }
    }
}
