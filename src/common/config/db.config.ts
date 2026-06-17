import { ConfigType, registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const dbConfig = registerAs('db', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'postgres',
}));

export type dbConfigType = ConfigType<typeof dbConfig>;
