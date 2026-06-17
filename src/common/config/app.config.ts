import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  hashSalt: process.env.HASH_SALT,
  hashSaltRounds: Number(process.env.HASH_SALT_ROUNDS) || 10,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
}));

export type TAppConfig = ConfigType<typeof appConfig>;
