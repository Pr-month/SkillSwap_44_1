import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { RequestsRepository } from './requests.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requests } from './entities/request.entity';
import { UsersModule } from '../users/users.module';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Requests, Skill, User]),
    UsersModule,
    NotificationModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService, RequestsRepository],
  exports: [RequestsRepository],
})
export class RequestsModule {}
