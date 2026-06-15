import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserEntity } from './user.entity';
import { appConfig } from './common/config/app.config';
import { jwtConfig } from './common/config/jwt.config';

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
    AuthModule, UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
