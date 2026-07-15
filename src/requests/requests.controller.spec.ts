import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { AuthenticatedRequest } from '../auth/types/auth.types';
import { UserRole } from '../users/users.enums';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Status } from './enum/status.enum';

describe('RequestsController', () => {
  let controller: RequestsController;
  let requestsService: {
    incoming: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    requestsService = {
      incoming: jest.fn(),
      update: jest.fn(),
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

  it('должен передавать обновление статуса заявки в сервис', async () => {
    const updateRequestDto: UpdateRequestDto = {
      status: Status.ACCEPTED,
    };
    const updatedRequest = {
      id: '1',
      status: Status.ACCEPTED,
      isRead: true,
    };
    const req = {
      user: {
        sub: '2',
        email: 'receiver@example.com',
        roleId: UserRole.USER,
      },
    } as AuthenticatedRequest;

    requestsService.update.mockResolvedValue(updatedRequest);

    await expect(controller.update('1', updateRequestDto, req)).resolves.toBe(
      updatedRequest,
    );
    expect(requestsService.update).toHaveBeenCalledWith(
      '1',
      updateRequestDto,
      req.user,
    );
  });
});
