import { ConfigType, registerAs } from '@nestjs/config';
import { join } from 'path';
import { DataSource } from 'typeorm';

export const databaseConfig = registerAs('DATABASE_CONFIG', () => ({
  url: process.env.DATABASE_URL?.trim(),
  synchronize: process.env.SYNCRONIZE === 'true',
}));

export type TDatabaseConfig = ConfigType<typeof databaseConfig>;

const database = databaseConfig();

export const dataSource = new DataSource({
  type: 'postgres',
  url: database.url,
  entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
  synchronize: database.synchronize,
  ssl: {
    rejectUnauthorized: false,
  },
});
