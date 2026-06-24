import type { JwtModuleOptions } from '@nestjs/jwt';

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
