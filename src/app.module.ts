import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { adminConfig } from './common/config/admin.config';
import { appConfig } from './common/config/app.config';
import {
  databaseConfig,
  TDatabaseConfig,
} from './common/config/database.config';
import { jwtConfig } from './common/config/jwt.config';
import { LoggerModule } from './logger/logger.module';
import { SkillsModule } from './skills/skills.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RequestsModule } from './requests/requests.module';
import { CategoriesModule } from './categories/categories.module';
import { CitiesModule } from './cities/cities.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, adminConfig, databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: TDatabaseConfig) => ({
        ...config,
        autoLoadEntities: true,
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
    CitiesModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
