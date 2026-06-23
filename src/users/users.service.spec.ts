import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UserRepository;

  const mockRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return user by id', async () => {
    const expectedUser = { id: '1' } as User;
    mockRepository.findOne.mockResolvedValue(expectedUser);

    await expect(service.findById('1')).resolves.toBe(expectedUser);
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
