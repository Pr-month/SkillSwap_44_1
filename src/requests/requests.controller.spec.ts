import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { AuthenticatedRequest } from '../auth/types/auth.types';
import { UserRole } from '../users/users.enums';

describe('RequestsController', () => {
  let controller: RequestsController;
  let requestsService: {
    incoming: jest.Mock;
  };

  beforeEach(async () => {
    requestsService = {
      incoming: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: requestsService,
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  it('должен возвращать входящие заявки из сервиса', async () => {
    const incomingRequests = [
      {
        id: '1',
        status: 'pending',
        isRead: false,
      },
    ];
    const req = {
      user: {
        sub: '2',
        email: 'receiver@example.com',
        roleId: UserRole.USER,
      },
    } as AuthenticatedRequest;

    requestsService.incoming.mockResolvedValue(incomingRequests);

    await expect(controller.incoming(req)).resolves.toBe(incomingRequests);
    expect(requestsService.incoming).toHaveBeenCalledWith(req.user);
  });
});
