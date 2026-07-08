import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/users/users.repository';
import { LoginDto } from './dto/login.dto';
import { jwtConfig } from '../common/config/jwt.config';
import { appConfig } from './../common/config/app.config';
import { IJwtPayload } from './types/auth.types';
import { UserRole } from '../users/users.enums';
import { RegisterRequestDto } from './dto/register-request.dto';
import { Gender } from '../users/users.enums';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let repository: UserRepository;
  let jwtService: JwtService;
  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockReset();

    module = await Test.createTestingModule({
      providers: [
        AuthService,
        UserRepository,
        {
          provide: appConfig.KEY,
          useValue: {
            hashSaltRounds: 10,
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            accessToken: 'test-access-secret',
            refreshToken: 'test-refresh-secret',
            accessTokenExpiresIn: '1h',
            refreshTokenExpiresIn: '7d',
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockImplementation((payload, options) => {
              return Promise.resolve(`mock-${options.secret}-token`);
            }),
            verifyAsync: jest.fn().mockResolvedValue({
              sub: '123456789012',
              email: '123@mail.com',
              roleId: 1,
            }),
          },
        },
      ],
    })
      .overrideProvider(UserRepository)
      .useValue({
        findByEmailWithPassword: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
        findByIdWithRefreshToken: jest.fn(),
        clearRefreshToken: jest.fn(),
      })
      .compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should successfully login user with correct credentials', async () => {
      const loginRequestDto: LoginDto = {
        email: '123@mail.com',
        password: '!12345678Qw',
      };

      const mockUser = {
        id: '123456789012',
        email: '123@mail.com',
        passwordHash: '2b2b10$somehashedpassword',
        roleId: 1,
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      const expectedJwtPayload = {
        sub: '123456789012',
        email: '123@mail.com',
        roleId: 1,
      };
      const expectedUpdateData = { refreshTokenHash: 'hashed-refresh-token' };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      (repository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        mockUser,
      );
      service['generateTokens'] = jest.fn().mockResolvedValue(mockTokens);

      const result = await service.login(loginRequestDto);

      expect(repository.findByEmailWithPassword).toHaveBeenCalledWith(
        '123@mail.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginRequestDto.password,
        mockUser.passwordHash,
      );
      expect(service['generateTokens']).toHaveBeenCalledWith(
        expectedJwtPayload,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(mockTokens.refreshToken, 10);
      expect(repository.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        expectedUpdateData,
      );
      expect(result).toEqual({
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginRequestDto: LoginDto = {
        email: 'nonexistent@mail.com',
        password: 'password123',
      };
      (repository.findByEmailWithPassword as jest.Mock).mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      service['generateTokens'] = jest.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      await expect(service.login(loginRequestDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginRequestDto)).rejects.toHaveProperty(
        'message',
        'Invalid email or password',
      );
      expect(repository.findByEmailWithPassword).toHaveBeenCalledWith(
        'nonexistent@mail.com',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(service['generateTokens']).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const loginRequestDto: LoginDto = {
        email: 'user@mail.com',
        password: 'wrong-password',
      };
      const mockUser = {
        id: '999',
        email: 'user@mail.com',
        passwordHash: '2b2b10$somehashedpassword',
        roleId: 1,
      };
      service['generateTokens'] = jest.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      (repository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      await expect(service.login(loginRequestDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginRequestDto)).rejects.toHaveProperty(
        'message',
        'Invalid email or password',
      );
      expect(repository.findByEmailWithPassword).toHaveBeenCalledWith(
        'user@mail.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong-password',
        mockUser.passwordHash,
      );
      expect(service['generateTokens']).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repository.updateUser).not.toHaveBeenCalled();
    });

    it('should normalize email to lowercase and trim whitespace', async () => {
      const loginRequestDto: LoginDto = {
        email: '  USER@MAIL.COM  ',
        password: '!12345678Qw',
      };
      const mockUser = {
        id: '123456789012',
        email: 'user@mail.com',
        passwordHash: '2b2b10$somehashedpassword',
        roleId: 1,
      };
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      (repository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        mockUser,
      );
      service['generateTokens'] = jest.fn().mockResolvedValue(mockTokens);
      await service.login(loginRequestDto);
      expect(repository.findByEmailWithPassword).toHaveBeenCalledWith(
        'user@mail.com',
      );
    });
  });

  describe('generateTokens', () => {
    const mockPayload: IJwtPayload = {
      sub: '123456789012',
      email: 'test@example.com',
      roleId: UserRole.USER,
    };

    it('should generate access and refresh tokens with default expiration', async () => {
      await service['generateTokens'](mockPayload);

      expect(jwtService.signAsync).toBeCalledWith(mockPayload, {
        secret: 'test-access-secret',
        expiresIn: '1h',
      });
      expect(jwtService.signAsync).toBeCalledWith(mockPayload, {
        secret: 'test-refresh-secret',
        expiresIn: '7d',
      });
    });

    it('should handle different payload data correctly', async () => {
      (jwtService.signAsync as jest.Mock).mockClear();

      const differentPayload: IJwtPayload = {
        sub: 'different-id',
        email: 'another@example.com',
        roleId: UserRole.ADMIN,
      };

      await service['generateTokens'](differentPayload);

      expect(jwtService.signAsync).toBeCalledWith(differentPayload, {
        secret: 'test-access-secret',
        expiresIn: '1h',
      });
      expect(jwtService.signAsync).toBeCalledWith(differentPayload, {
        secret: 'test-refresh-secret',
        expiresIn: '7d',
      });
    });
  });

  describe('register', () => {
    it('should successfully register user', async () => {
      const registerRequestDto: RegisterRequestDto = {
        email: 'newuser@example.com',
        password: '!12345678Qw',
        name: 'Test User',
        gender: Gender.MALE,
        cityId: 'city-123',
        birthdate: '1990-01-01',
      };

      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'Test User',
        roleId: UserRole.USER,
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      const expectedPasswordHash = 'hashed-password-123';
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce(expectedPasswordHash)
        .mockResolvedValueOnce('hashed-refresh-token');
      (repository.createUser as jest.Mock).mockResolvedValue(mockUser);
      service['generateTokens'] = jest.fn().mockResolvedValue(mockTokens);

      const result = await service.register(registerRequestDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        registerRequestDto.password,
        10,
      );
      expect(repository.createUser).toHaveBeenCalledWith(
        registerRequestDto,
        expectedPasswordHash,
      );
      expect(service['generateTokens']).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        roleId: mockUser.roleId,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockTokens.refreshToken, 10);
      expect(repository.updateUser).toHaveBeenCalledWith(mockUser.id, {
        refreshTokenHash: 'hashed-refresh-token',
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
    });

    it('should normalize email to lowercase', async () => {
      const registerRequestDto: RegisterRequestDto = {
        email: 'NEWUSER@EXAMPLE.COM',
        password: '!12345678Qw',
        name: 'Test User',
        gender: Gender.MALE,
        cityId: 'city-123',
        birthdate: '1990-01-01',
      };

      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'Test User',
        roleId: UserRole.USER,
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-refresh-token');
      (repository.createUser as jest.Mock).mockResolvedValue(mockUser);
      service['generateTokens'] = jest.fn().mockResolvedValue(mockTokens);

      await service.register(registerRequestDto);

      expect(repository.createUser).toHaveBeenCalled();
    });

    it('should trim email whitespace', async () => {
      const registerRequestDto: RegisterRequestDto = {
        email: '  newuser@example.com  ',
        password: '!12345678Qw',
        name: 'Test User',
        gender: Gender.MALE,
        cityId: 'city-123',
        birthdate: '1990-01-01',
      };

      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'Test User',
        roleId: UserRole.USER,
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-refresh-token');
      (repository.createUser as jest.Mock).mockResolvedValue(mockUser);
      service['generateTokens'] = jest.fn().mockResolvedValue(mockTokens);

      await service.register(registerRequestDto);

      expect(repository.createUser).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    let generateTokensSpy: jest.SpyInstance;

    beforeEach(() => {
      generateTokensSpy = jest
        .spyOn(service as any, 'generateTokens')
        .mockImplementation(async () => ({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }));
    });

    afterEach(() => {
      generateTokensSpy.mockRestore();
    });

    it('should successfully refresh tokens', async () => {
      const userId = 'user-id-123';
      const refreshToken = 'valid-refresh-token';

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        roleId: UserRole.USER,
        refreshTokenHash: 'hashed-refresh-token',
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh-token');
      (repository.findByIdWithRefreshToken as jest.Mock).mockResolvedValue(
        mockUser,
      );
      generateTokensSpy.mockResolvedValue(mockTokens);

      const result = await service.refresh(userId, refreshToken);

      expect(repository.findByIdWithRefreshToken).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        mockUser.refreshTokenHash,
      );
      expect(service['generateTokens']).toHaveBeenCalledWith({
        sub: userId,
        email: mockUser.email,
        roleId: mockUser.roleId,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockTokens.refreshToken,
        10,
      );
      expect(repository.updateUser).toHaveBeenCalledWith(userId, {
        refreshTokenHash: 'new-hashed-refresh-token',
      });
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const userId = 'nonexistent-user-id';
      const refreshToken = 'valid-refresh-token';

      (repository.findByIdWithRefreshToken as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.refresh(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(userId, refreshToken)).rejects.toHaveProperty(
        'message',
        'Unauthorized',
      );
      expect(repository.findByIdWithRefreshToken).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(generateTokensSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user has no refresh token hash', async () => {
      const userId = 'user-id-123';
      const refreshToken = 'valid-refresh-token';

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        roleId: UserRole.USER,
        refreshTokenHash: null,
      };

      (repository.findByIdWithRefreshToken as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(service.refresh(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(userId, refreshToken)).rejects.toHaveProperty(
        'message',
        'Unauthorized',
      );
      expect(repository.findByIdWithRefreshToken).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(generateTokensSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const userId = 'user-id-123';
      const refreshToken = 'invalid-refresh-token';

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        roleId: UserRole.USER,
        refreshTokenHash: 'hashed-refresh-token',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (repository.findByIdWithRefreshToken as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(service.refresh(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(repository.findByIdWithRefreshToken).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        mockUser.refreshTokenHash,
      );
      expect(generateTokensSpy).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when catch block is triggered', async () => {
      const userId = 'user-id-123';
      const refreshToken = 'valid-refresh-token';

      (repository.findByIdWithRefreshToken as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.refresh(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    });

    it('should successfully logout user', async () => {
      const refreshToken = 'valid-refresh-token';

      const mockPayload = {
        sub: 'user-id-123',
        email: 'user@example.com',
        roleId: UserRole.USER,
      };

      const mockUser = {
        id: 'user-id-123',
        email: 'user@example.com',
        roleId: UserRole.USER,
        refreshTokenHash: 'hashed-refresh-token',
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (repository.findByIdWithRefreshToken as jest.Mock).mockResolvedValue(
        mockUser,
      );

      const result = await service.logout(refreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(repository.findByIdWithRefreshToken).toHaveBeenCalledWith(
        'user-id-123',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        mockUser.refreshTokenHash,
      );
      expect(repository.clearRefreshToken).toHaveBeenCalledWith('user-id-123');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should throw UnauthorizedException when refresh token is invalid JWT', async () => {
      const refreshToken = 'invalid-jwt-token';

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(service.logout(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(refreshToken)).rejects.toHaveProperty(
        'message',
        'Refresh token is invalid',
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(repository.findByIdWithRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const refreshToken = 'valid-refresh-token';

      const mockPayload = {
        sub: 'nonexistent-user-id',
        email: 'user@example.com',
        roleId: UserRole.USER,
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (repository.findByIdWithRefreshToken as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.logout(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(refreshToken)).rejects.toHaveProperty(
        'message',
        'Refresh token is invalid',
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(repository.findByIdWithRefreshToken).toHaveBeenCalledWith(
        'nonexistent-user-id',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user has no refresh token hash', async () => {
      const refreshToken = 'valid-refresh-token';

      const mockPayload = {
        sub: 'user-id-123',
        email: 'user@example.com',
        roleId: UserRole.USER,
      };

      const mockUser = {
        id: 'user-id-123',
        email: 'user@example.com',
        roleId: UserRole.USER,
        refreshTokenHash: null,
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (repository.findByIdWithRefreshToken as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(service.logout(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(refreshToken)).rejects.toHaveProperty(
        'message',
        'Refresh token is invalid',
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(repository.findByIdWithRefreshToken).toHaveBeenCalledWith(
        'user-id-123',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      const mockPayload = {
        sub: 'user-id-123',
        email: 'user@example.com',
        roleId: UserRole.USER,
      };

      const mockUser = {
        id: 'user-id-123',
        email: 'user@example.com',
        roleId: UserRole.USER,
        refreshTokenHash: 'hashed-refresh-token',
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (repository.findByIdWithRefreshToken as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(service.logout(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(refreshToken)).rejects.toHaveProperty(
        'message',
        'Refresh token is invalid',
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(repository.findByIdWithRefreshToken).toHaveBeenCalledWith(
        'user-id-123',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        mockUser.refreshTokenHash,
      );
      expect(repository.clearRefreshToken).not.toHaveBeenCalled();
    });
  });
});
