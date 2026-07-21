import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NotificationPayload } from './notification.types';

export const NOTIFICATION_EVENT = 'notificateNewRequest';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly wsJwtGuard: WsJwtGuard) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = this.wsJwtGuard.verify(client.handshake.query?.token);

      await client.join(String(user.sub));
    } catch {
      client.disconnect(true);
    }
  }

  notifyUser(userId: string, payload: NotificationPayload): void {
    this.server.to(String(userId)).emit(NOTIFICATION_EVENT, payload);
  }
}
