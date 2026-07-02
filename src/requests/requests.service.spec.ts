import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { RequestsRepository } from './requests.repository';
import { UserRole } from '../users/users.enums';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestsRepository: {
    getIncomingRequests: jest.Mock;
  };

  beforeEach(async () => {
    requestsRepository = {
      getIncomingRequests: jest.fn(),
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

    await expect(
      service.incoming({
        sub: '2',
        email: 'receiver@example.com',
        roleId: UserRole.USER,
      }),
    ).resolves.toBe(incomingRequests);
    expect(requestsRepository.getIncomingRequests).toHaveBeenCalledWith('2');
  });
});
