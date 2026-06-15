import { ConfigType, registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('JWT_CONFIG', () => ({
  accessToken: process.env.JWT_ACCESS_KEY,
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
  refreshToken: process.env.JWT_REFRESH_KEY,
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

export type TJwtConfig = ConfigType<typeof jwtConfig>;
