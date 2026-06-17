import { ConfigType, registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('JWT_CONFIG', () => ({
  accessToken: process.env.JWT_ACCESS_KEY || 'jwtaccesskey',
  accessTokenExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '1h') as `${number}h` | `${number}d` | `${number}m`,
  refreshToken: process.env.JWT_REFRESH_KEY || 'jwtrefreshkey',
  refreshTokenExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as `${number}h` | `${number}d` | `${number}m`,
}));

export type TJwtConfig = ConfigType<typeof jwtConfig>;
