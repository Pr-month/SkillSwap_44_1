import * as dotenv from 'dotenv';
import { ConfigType, registerAs } from '@nestjs/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

export const databaseConfig = registerAs(
  'DATABASE_CONFIG',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'my_db',

    entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],

    synchronize: false,

    ssl: {
      rejectUnauthorized: false,
    },

    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
);

export type TDatabaseConfig = ConfigType<typeof databaseConfig>;

export const dataSource = new DataSource({
  ...databaseConfig(),
});
