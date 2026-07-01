import { ConfigType, registerAs } from '@nestjs/config';
import ms from 'ms';

export const jwtConfig = registerAs('JWT_CONFIG', () => ({
  accessToken: process.env.JWT_ACCESS_KEY || 'jwtaccesskey',
  accessTokenExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ||
    '1h') as ms.StringValue,
  refreshToken: process.env.JWT_REFRESH_KEY || 'jwtrefreshkey',
  refreshTokenExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
    '7d') as ms.StringValue,
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
}));

export type TJwtConfig = ConfigType<typeof jwtConfig>;
