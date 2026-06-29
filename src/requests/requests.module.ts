import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { RequestsRepository } from './requests.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requests } from './entities/request.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Requests]), UsersModule],
  controllers: [RequestsController],
  providers: [RequestsService, RequestsRepository],
  exports: [RequestsRepository],
})
export class RequestsModule {}
