import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

import { AuthModule } from './auth/auth.module';
import { appConfig } from './common/config/app.config';
import { jwtConfig } from './common/config/jwt.config';
import { LoggerModule } from './logger/logger.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),

    AuthModule,
    UsersModule,
    LoggerModule,
    SkillsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
