import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';

import { dbConfig } from './common/config/db.config';

import { appConfig } from './common/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig, appConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (db: ConfigType<typeof dbConfig>) => ({
        type: 'postgres',
        host: db.host,
        port: db.port,
        username: db.username,
        password: db.password,
        database: db.database,

        autoLoadEntities: true,
        synchronize: false,

        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),

    TypeOrmModule.forFeature([User, Role]),
  ],

  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}

