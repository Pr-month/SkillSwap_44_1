import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { AppLoggerService } from '../src/logger/logger.service';

describe('Auth E2E', () => {
  let app: INestApplication;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  const mockLogger = {
    setContext: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a user', async () => {
      mockAuthService.register.mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
          gender: 'male',
          cityId: '1',
          birthdate: '1995-01-01',
          about: 'Test user',
          avatar: null,
          wantToLearn: [],
          skills: [],
          favouriteSkills: [],
        })
        .expect(201);

      expect(response.body).toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Test User',
          gender: 'male',
          cityId: '1',
          birthdate: '1995-01-01',
          about: 'Test user',
          avatar: null,
          wantToLearn: [],
          skills: [],
          favouriteSkills: [],
        })
        .expect(400);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      mockAuthService.login.mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    it('should reject missing password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });
});
