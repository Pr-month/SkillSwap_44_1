import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

import { AuthModule } from './auth/auth.module';
import { adminConfig } from './common/config/admin.config';
import { appConfig } from './common/config/app.config';
import { databaseConfig } from './common/config/database.config';
import { jwtConfig } from './common/config/jwt.config';
import { LoggerModule } from './logger/logger.module';
import { SkillsModule } from './skills/skills.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RequestsModule } from './requests/requests.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, adminConfig, databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_CONFIG.url'),
        synchronize: config.getOrThrow<boolean>('DATABASE_CONFIG.synchronize'),
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'uploads'),
      serveRoot: '/public/uploads',
    }),

    AuthModule,
    UsersModule,
    LoggerModule,
    SkillsModule,
    FilesModule,
    RequestsModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
