import type { JwtModuleOptions } from '@nestjs/jwt';
import type { Request } from 'express';

export interface IJwtPayload {
  sub: string;
  email: string;
  roleId: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

export type JwtExpiresIn = NonNullable<
  JwtModuleOptions['signOptions']
>['expiresIn'];
