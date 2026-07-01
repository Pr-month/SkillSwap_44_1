import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import type { AuthenticatedRequest } from '../auth/types/auth.types';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return current user', async () => {
    const user = { id: '1', email: 'test@test.com' };
    mockUsersService.findById.mockResolvedValue(user);

    await expect(
      controller.getCurrentUser({
        user: { sub: '1', email: 'test@test.com', roleId: 1 },
      } as AuthenticatedRequest),
    ).resolves.toBe(user);
    expect(mockUsersService.findById).toHaveBeenCalledWith('1');
  });
});
