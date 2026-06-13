import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const dbConfig = registerAs('db', (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'aws-0-eu-west-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER || 'postgres.anlmwcgmlptkcxbbpdnx',
    password: process.env.DB_PASSWORD || 'Wadik1996121413',
    database: process.env.DB_NAME || 'postgres'
}))