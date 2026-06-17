import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';

// было:
// import { UserEntity } from '../user.entity';
// добавил энтити юзера
import { User } from '../users/entities/user.entity';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '1d') as NonNullable<
  JwtModuleOptions['signOptions']
>['expiresIn'];
import { JwtExpiresIn } from './auth.types';

@Module({
  imports: [
    // изменил юзера
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET') ?? 'development-secret',
        signOptions: {
          expiresIn: (config.get<string>('JWT_ACCESS_EXPIRES_IN') ??
            '1h') as JwtExpiresIn,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
