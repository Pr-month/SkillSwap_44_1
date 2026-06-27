import { ConfigType, registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('DATABASE_CONFIG', () => ({
  url: process.env.DATABASE_URL?.trim(),
}));

export type TDatabaseConfig = ConfigType<typeof databaseConfig>;
