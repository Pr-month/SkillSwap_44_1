import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../constants/roles.constants';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockExecutionContext = (user?: {
    role?: string;
    roleId?: number | string;
  }): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const context = mockExecutionContext({
        role: 'USER',
        roleId: 2,
      });

      expect(guard.canActivate(context)).toBe(true);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should return false when user is missing', () => {
      reflector.getAllAndOverride.mockReturnValue(['USER']);

      const context = mockExecutionContext();

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return false when user has no role', () => {
      reflector.getAllAndOverride.mockReturnValue(['USER']);

      const context = mockExecutionContext({
        roleId: 2,
      });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return true for ADMIN when ADMIN role is required', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      const context = mockExecutionContext({
        role: 'ADMIN',
        roleId: 1,
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false for ADMIN when USER role is required', () => {
      reflector.getAllAndOverride.mockReturnValue(['USER']);

      const context = mockExecutionContext({
        role: 'ADMIN',
        roleId: 1,
      });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return true for USER when USER role is required', () => {
      reflector.getAllAndOverride.mockReturnValue(['USER']);

      const context = mockExecutionContext({
        role: 'USER',
        roleId: 2,
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false for USER when ADMIN role is required', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      const context = mockExecutionContext({
        role: 'USER',
        roleId: 2,
      });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return true when user role matches one of required roles', () => {
      reflector.getAllAndOverride.mockReturnValue([
        'MODERATOR',
        'ADMIN',
        'USER',
      ]);

      const context = mockExecutionContext({
        role: 'USER',
        roleId: 2,
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false when user role does not match any required role', () => {
      reflector.getAllAndOverride.mockReturnValue(['MODERATOR', 'ADMIN']);

      const context = mockExecutionContext({
        role: 'USER',
        roleId: 2,
      });

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
