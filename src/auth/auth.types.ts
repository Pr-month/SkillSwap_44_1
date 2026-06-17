import type { JwtModuleOptions } from '@nestjs/jwt';
import { UserRole } from '../users/users.enums';

export interface IJwtPayload {
  sub: string;
  email: string;
  roleId: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export type JwtExpiresIn = NonNullable<
  JwtModuleOptions['signOptions']
>['expiresIn'];
