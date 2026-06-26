import type { JwtModuleOptions } from '@nestjs/jwt';
import type { Request } from 'express';
import { RequestWithUser } from '../../users/types/requestWithUser.type';

export interface IJwtPayload {
  sub: string;
  email: string;
  roleId: number;
}

export interface AuthenticatedRequest extends Request {
  user: IJwtPayload;
}

export type JwtExpiresIn = NonNullable<
  JwtModuleOptions['signOptions']
>['expiresIn'];

export interface RequestWithRefreshToken extends Omit<RequestWithUser, 'user'> {
  user: RequestWithUser['user'] & {
    refreshToken: string;
  };
}