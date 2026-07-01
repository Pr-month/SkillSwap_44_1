import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  hashSaltRounds: Number(process.env.HASH_SALT_ROUNDS) || 10,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'debug',
}));
export type TAppConfig = ConfigType<typeof appConfig>;
