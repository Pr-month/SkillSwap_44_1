import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { RequestsRepository } from './requests.repository';
import { UserRole } from '../users/users.enums';
import { Status } from './enum/status.enum';
import { UpdateRequestDto } from './dto/update-request.dto';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestsRepository: {
    getIncomingRequests: jest.Mock;
    updateIncomingStatus: jest.Mock;
  };

  const receiver = {
    sub: '2',
    email: 'receiver@example.com',
    roleId: UserRole.USER,
  };

  beforeEach(async () => {
    requestsRepository = {
      getIncomingRequests: jest.fn(),
      updateIncomingStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: RequestsRepository,
          useValue: requestsRepository,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  it('должен возвращать входящие заявки текущего пользователя', async () => {
    const incomingRequests = [
      {
        id: '1',
        status: 'pending',
        isRead: false,
      },
    ];

    requestsRepository.getIncomingRequests.mockResolvedValue(incomingRequests);

    await expect(service.incoming(receiver)).resolves.toBe(incomingRequests);
    expect(requestsRepository.getIncomingRequests).toHaveBeenCalledWith('2');
  });

  it('должен передавать обновление статуса входящей заявки в репозиторий', async () => {
    const updateRequestDto: UpdateRequestDto = {
      status: Status.ACCEPTED,
    };
    const updatedRequest = {
      id: '1',
      status: Status.ACCEPTED,
      isRead: true,
    };

    requestsRepository.updateIncomingStatus.mockResolvedValue(updatedRequest);

    await expect(service.update('1', updateRequestDto, receiver)).resolves.toBe(
      updatedRequest,
    );
    expect(requestsRepository.updateIncomingStatus).toHaveBeenCalledWith(
      '1',
      Status.ACCEPTED,
      '2',
    );
  });
});
