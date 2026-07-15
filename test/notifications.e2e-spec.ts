import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { io, Socket as ClientSocket } from 'socket.io-client';
import { IJwtPayload } from '../src/auth/types/auth.types';
import { WsJwtGuard } from '../src/notification/guards/ws-jwt.guard';
import {
  NotificationPayload,
  NotificationType,
} from '../src/notification/notification.types';
import {
  NOTIFICATION_EVENT,
  NotificationsGateway,
} from '../src/notification/notifications.gateway';
import { UserRole } from '../src/users/users.enums';

describe('NotificationsGateway (e2e)', () => {
  let app: INestApplication;
  let gateway: NotificationsGateway;
  let jwtService: JwtService;
  let client: ClientSocket | undefined;
  let serverUrl: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'e2e-access-secret' })],
      providers: [NotificationsGateway, WsJwtGuard],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0, '127.0.0.1');

    const httpServer = app.getHttpServer() as HttpServer;
    const address = httpServer.address() as AddressInfo;
    serverUrl = `http://127.0.0.1:${address.port}`;
    gateway = app.get(NotificationsGateway);
    jwtService = app.get(JwtService);
  });

  afterEach(() => {
    client?.disconnect();
    client = undefined;
  });

  afterAll(async () => {
    await app.close();
  });

  it('доставляет уведомление авторизованному пользователю', async () => {
    const user: IJwtPayload = {
      sub: 'receiver-id',
      email: 'receiver@example.com',
      roleId: UserRole.USER,
    };
    const token = jwtService.sign(user);
    const notification: NotificationPayload = {
      type: NotificationType.NEW_REQUEST,
      message: 'Поступила новая заявка от Анны',
      requestId: 'request-id',
      skillTitle: 'Английский язык',
      user: {
        id: 'sender-id',
        name: 'Анна',
        avatar: null,
      },
    };

    client = io(serverUrl, {
      query: { token },
      transports: ['websocket'],
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      client?.once('connect', resolve);
      client?.once('connect_error', reject);
    });

    const receivedNotification = new Promise<NotificationPayload>((resolve) => {
      client?.once(NOTIFICATION_EVENT, resolve);
    });

    gateway.notifyUser(user.sub, notification);

    await expect(receivedNotification).resolves.toEqual(notification);
  });

  it('отключает пользователя с недействительным JWT-токеном', async () => {
    client = io(serverUrl, {
      query: { token: 'invalid-token' },
      transports: ['websocket'],
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Сервер не отключил неавторизованного пользователя'));
      }, 3000);

      client?.once('disconnect', () => {
        clearTimeout(timeout);
        resolve();
      });
      client?.once('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    expect(client.connected).toBe(false);
  });
});
