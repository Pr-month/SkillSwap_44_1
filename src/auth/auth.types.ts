import type { JwtModuleOptions } from '@nestjs/jwt';

export interface IJwtPayload {
  sub: string;
  email: string;
  roleId: number;
}

export type JwtExpiresIn = NonNullable<
  JwtModuleOptions['signOptions']
>['expiresIn'];
