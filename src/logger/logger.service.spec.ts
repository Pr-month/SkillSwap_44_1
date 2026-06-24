/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerService } from './logger.service';
import { Logger } from 'winston';

describe('AppLoggerService', () => {
  let service: AppLoggerService;
  let mockWinston: jest.Mocked<Logger>;

  beforeEach(async () => {
    mockWinston = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppLoggerService,
        {
          provide: 'winston',
          useValue: mockWinston,
        },
      ],
    }).compile();

    service = await module.resolve<AppLoggerService>(AppLoggerService);
    service.setContext('Test');
  });

  describe('log', () => {
    it('should call winston.info with message and context', () => {
      service.log('test message');
      expect(mockWinston.info).toHaveBeenCalledWith('test message', {
        context: 'Test',
      });
    });

    it('should call winston.info with meta data', () => {
      service.log('test message', { userId: 123 });
      expect(mockWinston.info).toHaveBeenCalledWith('test message', {
        context: 'Test',
        userId: 123,
      });
    });

    it('should sanitize sensitive fields', () => {
      service.log('test', { password: 'secret', email: 'test@test.com' });

      expect(mockWinston.info).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({
          context: 'Test',
          email: 'test@test.com',
          password: expect.stringMatching(/^\[REDACTED:/),
        }),
      );
    });
  });

  describe('error', () => {
    it('should call winston.error with trace', () => {
      const error = new Error('test error');
      service.error('error message', error.stack, { code: 500 });
      expect(mockWinston.error).toHaveBeenCalledWith('error message', {
        context: 'Test',
        trace: error.stack,
        code: 500,
      });
    });
  });

  describe('warn', () => {
    it('should call winston.warn', () => {
      service.warn('warning message', { code: 'W001' });
      expect(mockWinston.warn).toHaveBeenCalledWith('warning message', {
        context: 'Test',
        code: 'W001',
      });
    });
  });

  describe('debug', () => {
    it('should call winston.debug', () => {
      service.debug('debug message', { data: 123 });
      expect(mockWinston.debug).toHaveBeenCalledWith('debug message', {
        context: 'Test',
        data: 123,
      });
    });
  });

  describe('setContext', () => {
    it('should set context for subsequent logs', () => {
      service.setContext('NewContext');
      service.log('test');
      expect(mockWinston.info).toHaveBeenCalledWith('test', {
        context: 'NewContext',
      });
    });
  });

  it('should handle meta with custom fields', () => {
    service.log('test', { customField: 'AuthService' });
    expect(mockWinston.info).toHaveBeenCalledWith('test', {
      context: 'Test',
      customField: 'AuthService',
    });
  });

  it('should handle null meta', () => {
    service.log('test', null as any);
    expect(mockWinston.info).toHaveBeenCalledWith('test', {
      context: 'Test',
    });
  });

  it('should handle undefined meta', () => {
    service.log('test');
    expect(mockWinston.info).toHaveBeenCalledWith('test', {
      context: 'Test',
    });
  });
});
