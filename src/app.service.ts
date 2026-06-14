import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { ConfigType } from '@nestjs/config';
import { dbConfig, dbConfigType } from './config/db.config';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(dbConfig.KEY)
    private readonly configService: dbConfigType,
  ) {}

  async getUsers() {
    this.configService.host
    return this.usersRepository.find();
  }
}
