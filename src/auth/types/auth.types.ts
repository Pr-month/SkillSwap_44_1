import type { JwtModuleOptions } from '@nestjs/jwt';
import type { Request } from 'express';
import { UserRole } from '../../users/users.enums';

export interface IJwtPayload {
  sub: string;
  email: string;
  roleId: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: IJwtPayload;
}

export type JwtExpiresIn = NonNullable<
  JwtModuleOptions['signOptions']
>['expiresIn'];

export interface RequestWithRefreshToken extends Request {
  user: IJwtPayload & {
    refreshToken: string;
  };
}
